// public/js/compass.js

const arrow = document.getElementById('arrow');
const headingText = document.getElementById('heading');
const btnPermis = document.getElementById('btn-permis');

function handleOrientation(event) {
    let compass;

    // iOS (webkit) té la seva pròpia propietat
    if (event.webkitCompassHeading) {
        compass = event.webkitCompassHeading;
    } else {
        // Android i altres
        compass = 360 - event.alpha; 
    }

    if (compass) {
        const angle = Math.round(compass);
        headingText.innerText = `${angle}°`;
        
        // Girar la fletxa (restem 45 perquè la icona de font-awesome ja ve inclinada)
        arrow.style.transform = `rotate(${angle - 45}deg)`;
    }
}

async function activarBrúixola() {
    // Comprovar si iOS demana permís (iOS 13+)
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            const response = await DeviceOrientationEvent.requestPermission();
            if (response === 'granted') {
                window.addEventListener('deviceorientation', handleOrientation, true);
                btnPermis.style.display = 'none';
            }
        } catch (error) {
            alert("No s'han pogut activar els sensors");
        }
    } else {
        // Android o navegadors que no requereixen permís especial
        window.addEventListener('deviceorientation', handleOrientation, true);
        btnPermis.style.display = 'none';
    }
}

btnPermis.addEventListener('click', activarBrúixola);