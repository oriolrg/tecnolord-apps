# Constitution — SpecLord

1. **Spec abans que codi**  
   Cap funcionalitat nova s'implementa sense una especificació aprovada i versionada.

2. **Traçabilitat obligatòria**  
   Tot requisit funcional ha de poder relacionar-se amb les tasques i proves que el cobreixen.

3. **Core independent de la interfície**  
   La lògica d'SpecLord no dependrà de la CLI ni de futures interfícies web.

4. **Simplicitat abans que infraestructura**  
   No s'introduiran serveis, frameworks o dependències si la funcionalitat es pot resoldre de forma més simple.

5. **Tests com a criteri de finalització**  
   Una tasca no es considera acabada fins que les proves corresponents passen correctament.

6. **Canvis dirigits per especificació**  
   Si canvia un requisit, primer s'actualitza la spec i després el pla, les tasques, els tests i el codi afectat.

7. **Comportament determinista i verificable**  
   Les validacions d'SpecLord han de produir resultats reproduïbles sobre els mateixos fitxers d'entrada.

8. **No modificar els projectes analitzats per defecte**  
   SpecLord podrà inspeccionar i validar projectes, però no alterarà els seus fitxers tret que una funcionalitat futura ho especifiqui explícitament.