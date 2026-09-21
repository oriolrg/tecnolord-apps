#!/usr/bin/env python3
"""Deterministic invented land, contours and waterways. No external geodata."""
from pathlib import Path
import json, math, struct

def varint(value):
    result = bytearray()
    while value > 127:
        result.append((value & 127) | 128)
        value >>= 7
    result.append(value)
    return bytes(result)

def scalar(number, value): return varint(number << 3) + varint(value)
def blob(number, value): return varint((number << 3) | 2) + varint(len(value)) + value
def zigzag(value): return (value << 1) ^ (value >> 31)
def point(lon, lat):
    return (round((lon + 180) / 360 * 65536), round((1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * 65536))

def feature(coords, polygon=False):
    points = [point(*coord) for coord in coords]
    commands = [9, zigzag(points[0][0]), zigzag(points[0][1]), ((len(points)-1) << 3) | 2]
    for a, b in zip(points, points[1:]): commands += [zigzag(b[0]-a[0]), zigzag(b[1]-a[1])]
    if polygon: commands += [15]
    return scalar(3, 3 if polygon else 2) + blob(4, b''.join(varint(v) for v in commands))

def layer(name, features):
    return blob(3, blob(1, name.encode()) + b''.join(blob(2, f) for f in features) + scalar(5, 65536) + scalar(15, 2))

land = [(-173,-58),(-171,-58.4),(-169,-57.3),(-167.4,-57.5),(-165,-55.3),(-163.5,-53),(-164,-50.6),(-166,-50.3),(-167.8,-51.4),(-168.4,-52.7),(-170.5,-53.6),(-172.3,-55.4)]
# Screen-space clockwise winding for the exterior polygon.
land.reverse()
contours = []
for line in range(18):
    contours.append(feature([(-172+i*.14, -57+line*.35+math.sin(i*.15+line*.4)*.2) for i in range(57)]))
river = [(-171+i*.09,-57+i*.075+math.sin(i*.15)*.18) for i in range(75)]
tile = layer('synthetic_land', [feature(land, True)]) + layer('synthetic_reference', contours) + layer('synthetic_water', [feature(river)])
metadata = json.dumps({'name':'Territori inventat MeteoLord','description':'Synthetic geometry only. Not a real geographic map.','vector_layers':[{'id':name,'fields':{}} for name in ['synthetic_land','synthetic_reference','synthetic_water']]},separators=(',',':')).encode()
directory = b''.join(varint(n) for n in [1,0,1,len(tile),1])
header = bytearray(127); header[:7] = b'PMTiles'; header[7] = 3
for offset,value in [(8,127),(16,len(directory)),(24,127+len(directory)),(32,len(metadata)),(56,127+len(directory)+len(metadata)),(64,len(tile)),(72,1),(80,1),(88,1)]: struct.pack_into('<Q',header,offset,value)
header[96:102] = bytes([1,1,1,1,0,0])
for offset,value in [(102,-174),(106,-60),(110,-162),(114,-49),(119,-169),(123,-55)]: struct.pack_into('<i',header,offset,round(value*1e7))
header[118] = 6
Path(__file__).resolve().parents[2].joinpath('site/map-assets/map-a-synthetic.pmtiles').write_bytes(header+directory+metadata+tile)
