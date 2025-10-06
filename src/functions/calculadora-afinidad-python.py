class CalculadoraAfinidad:
    def __init__(self):
        """
        Inicializa la calculadora de afinidad
        """
        pass
    
    def calcular_afinidad(self, sujeto1, sujeto2):
        """
        Calcula la afinidad entre dos sujetos
        
        Args:
            sujeto1 (dict): Diccionario con nombres y valores del sujeto 1 (Empresa)
            sujeto2 (dict): Diccionario con nombres y valores del sujeto 2 (Alumno)
            
        Returns:
            dict: Resultado con información de afinidad
        """
        puntuacion = 0
        coincidencias = 0
        nombres_coincidentes = []
        tiene_coincidencia_premium = False
        tiene_coincidencia_valor2 = 0
        tiene_valoracion_superior = 0
        factor_proporcional = 1
        caso_especial_unica_coincidencia = False
        factor_cobertura = 1
        
        # Obtener totales del sujeto 1 (Empresa)
        total_nombres_sujeto1 = len(sujeto1)
        total_puntos_sujeto1 = sum(sujeto1.values())
        total_nombres_sujeto2 = len(sujeto2)
        
        # Factor proporcional basado en cantidad de nombres en sujeto2
        cantidad_sujeto2 = len(sujeto2)
        if cantidad_sujeto2 < 8:
            # Factor proporcional muy conservador
            factor_proporcional = 1 + ((8 - cantidad_sujeto2) / 30)
        
        # Recogemos todas las coincidencias primero para verificar casos especiales
        todas_las_coincidencias = []
        
        for nombre, valor in sujeto1.items():
            if nombre in sujeto2:
                todas_las_coincidencias.append({
                    'nombre': nombre,
                    'valorSujeto1': valor,
                    'valorSujeto2': sujeto2[nombre]
                })
        
        # DETECCIÓN ESPECÍFICA DEL CASO PROBLEMÁTICO:
        # Si hay una única coincidencia y más de 2 nombres en la empresa, asignar una puntuación máxima de 3
        puntuacion_maxima_una_coincidencia = 3.0
        caso_unica_coincidencia = False
        
        if len(todas_las_coincidencias) == 1 and total_nombres_sujeto1 >= 3:
            caso_unica_coincidencia = True
        
        # Verificar el caso especial 1: única coincidencia con valor 3 en sujeto1 y valor 1 en sujeto2
        if (len(todas_las_coincidencias) == 1 and 
            todas_las_coincidencias[0]['valorSujeto1'] == 3 and 
            todas_las_coincidencias[0]['valorSujeto2'] == 1):
            caso_especial_unica_coincidencia = True
        
        # Factor de cobertura: qué porcentaje de los nombres de la empresa están cubiertos
        # Mucho más estricto para baja cobertura
        cobertura = len(todas_las_coincidencias) / total_nombres_sujeto1 if total_nombres_sujeto1 > 0 else 0
        
        if cobertura < 0.8:
            # Factor de cobertura muy agresivo para penalizar baja cobertura
            factor_cobertura = 0.3 + (0.8 * cobertura)
        
        # Ahora procesamos las coincidencias con las reglas correspondientes
        for nombre, valor in sujeto1.items():
            if nombre in sujeto2:
                coincidencias += 1
                valor_base = 0
                es_premium = False
                es_valor2 = False
                es_valoracion_superior = False
                es_caso_especial = False
                es_unica_coincidencia = caso_unica_coincidencia
                bonus_text = ""
                
                valor_sujeto2 = sujeto2[nombre]
                
                # Nuevo sistema de valoración con valores muy reducidos
                if caso_especial_unica_coincidencia and valor == 3 and valor_sujeto2 == 1:
                    # Caso especial: única coincidencia 3-1
                    valor_base = 1.0
                    es_caso_especial = True
                    bonus_text = "Caso especial 3-1: valor reducido a 1.0"
                else:
                    # Caso especial de única coincidencia - usar valores más bajos
                    if es_unica_coincidencia:
                        # Para casos de única coincidencia, usar valores más conservadores
                        if valor == 1 and valor_sujeto2 == 3:
                            # Caso específico mencionado: a=1, b=3, c=3 y alumno solo a=3
                            valor_base = 2.5  # Valor máximo para este caso específico
                            bonus_text = "2.5 (única coincidencia 1-3, valor máximo)"
                            es_valoracion_superior = True
                        else:
                            # Otros casos de única coincidencia
                            # Usar una escala de 1.0 a 2.5 para todas las combinaciones
                            base_valor_unico = 1.0 + (0.5 * valor) + (0.3 * valor_sujeto2)
                            valor_base = min(base_valor_unico, puntuacion_maxima_una_coincidencia)
                            bonus_text = f"{valor_base:.1f} (única coincidencia {valor}-{valor_sujeto2})"
                            
                            if valor == 3 and valor_sujeto2 == 3:
                                es_premium = True
                                tiene_coincidencia_premium = True
                            elif valor == 2 and valor_sujeto2 == 2:
                                es_valor2 = True
                                tiene_coincidencia_valor2 += 1
                            elif valor_sujeto2 > valor:
                                es_valoracion_superior = True
                                tiene_valoracion_superior +=.1
                    else:
                        # Valores normales para múltiples coincidencias
                        if valor == 3:  # Si la empresa valora el nombre con 3
                            if valor_sujeto2 == 3:
                                valor_base = 3.0
                                es_premium = True
                                tiene_coincidencia_premium = True
                                bonus_text = "3.0 (coincidencia premium 3-3)"
                            elif valor_sujeto2 == 2:
                                valor_base = 2.0
                                bonus_text = "2.0 (coincidencia alta 3-2)"
                            elif valor_sujeto2 == 1:
                                valor_base = 1.2
                                bonus_text = "1.2 (coincidencia baja 3-1)"
                        elif valor == 2:  # Si la empresa valora el nombre con 2
                            if valor_sujeto2 == 3:
                                valor_base = 1.8
                                es_valoracion_superior = True
                                tiene_valoracion_superior += 1
                                bonus_text = "1.8 (valoración superior 2-3)"
                            elif valor_sujeto2 == 2:
                                valor_base = 1.6
                                es_valor2 = True
                                tiene_coincidencia_valor2 += 1
                                bonus_text = "1.6 (coincidencia valor 2)"
                            elif valor_sujeto2 == 1:
                                valor_base = 1.0
                                bonus_text = "1.0 (coincidencia 2-1)"
                        elif valor == 1:  # Si la empresa valora el nombre con 1
                            if valor_sujeto2 == 3:
                                valor_base = 1.2
                                es_valoracion_superior = True
                                tiene_valoracion_superior += 1
                                bonus_text = "1.2 (valoración superior 1-3)"
                            elif valor_sujeto2 == 2:
                                valor_base = 1.1
                                es_valoracion_superior = True
                                tiene_valoracion_superior += 1
                                bonus_text = "1.1 (valoración superior 1-2)"
                            elif valor_sujeto2 == 1:
                                valor_base = 0.8
                                bonus_text = "0.8 (coincidencia básica 1-1)"
                
                # Aplicar factor proporcional y restricciones
                if es_caso_especial:
                    valor_final = valor_base  # No aplicar factores al caso especial 3-1
                elif es_unica_coincidencia:
                    # Para única coincidencia, aplicar solo el factor proporcional con un límite superior
                    valor_final = min(valor_base * factor_proporcional, puntuacion_maxima_una_coincidencia)
                else:
                    # Caso normal: aplicar factor proporcional
                    valor_final = valor_base * factor_proporcional
                
                puntuacion += valor_final
                
                # Preparar información de la coincidencia para el resultado
                factor_prop_str = "N/A" if (es_caso_especial or es_unica_coincidencia) else f"{factor_proporcional:.2f}"
                nombres_coincidentes.append({
                    'nombre': nombre,
                    'valorSujeto1': valor,
                    'valorSujeto2': valor_sujeto2,
                    'valorBase': f"{valor_base:.1f}",
                    'bonusText': bonus_text,
                    'valorCalculado': f"{valor_final:.1f}",
                    'esPremium': es_premium,
                    'esValor2': es_valor2,
                    'esValoracionSuperior': es_valoracion_superior,
                    'esCasoEspecial': es_caso_especial,
                    'esUnicaCoincidencia': es_unica_coincidencia,
                    'factorProporcional': factor_prop_str
                })
        
        # Aplicar el factor de cobertura a la puntuación final, excepto en casos especiales
        if not caso_especial_unica_coincidencia and not caso_unica_coincidencia:
            puntuacion = puntuacion * factor_cobertura
        elif caso_unica_coincidencia:
            # Asegurar que la puntuación para única coincidencia nunca sea mayor a 3
            puntuacion = min(puntuacion, puntuacion_maxima_una_coincidencia)
        
        porcentaje_puntuacion = (puntuacion / 15) * 100 if puntuacion > 0 else 0
        
        # Determinar nivel según diversos criterios
        if caso_especial_unica_coincidencia:
            nivel = "bajo"
        elif caso_unica_coincidencia:
            # Para casos de única coincidencia, usar criterios más estrictos
            if puntuacion >= 2.5:
                nivel = "medio"
            else:
                nivel = "bajo"
        else:
            # Criterios normales para niveles de afinidad
            if ((coincidencias >= 3 and porcentaje_puntuacion >= 60) or 
                (coincidencias >= 2 and puntuacion >= 8) or
                (tiene_coincidencia_premium and coincidencias >= 2 and puntuacion >= 7 and cobertura >= 0.5) or
                (tiene_coincidencia_valor2 >= 2 and coincidencias >= 2) or
                (tiene_valoracion_superior >= 2 and puntuacion >= 7 and cobertura >= 0.5)):
                nivel = "muy alto"
            elif ((coincidencias >= 2 and porcentaje_puntuacion >= 40) or 
                (coincidencias >= 1 and puntuacion >= 6) or
                (tiene_coincidencia_premium and coincidencias >= 1 and cobertura >= 0.5) or
                (tiene_coincidencia_valor2 >= 1 and coincidencias >= 2) or
                (tiene_valoracion_superior >= 1 and puntuacion >= 5 and cobertura >= 0.4)):
                nivel = "alto"
            elif ((coincidencias >= 1 and porcentaje_puntuacion >= 20) or 
                puntuacion >= 3):
                nivel = "medio"
            else:
                nivel = "bajo"
        
        cobertura_porcentaje = f"{cobertura * 100:.0f}%"
        
        # Preparar el resultado final
        return {
            'nivel': nivel,
            'puntuacion': f"{puntuacion:.1f}",
            'coincidencias': coincidencias,
            'casoUnicaCoincidencia': caso_unica_coincidencia,
            'nombresSujeto1': total_nombres_sujeto1,
            'nombresSujeto2': total_nombres_sujeto2,
            'nombresCoincidentes': nombres_coincidentes,
            'tieneCoincidenciaPremium': tiene_coincidencia_premium,
            'tieneCoincidenciaValor2': tiene_coincidencia_valor2,
            'tieneValoracionSuperior': tiene_valoracion_superior,
            'casoEspecialUnicaCoincidencia': caso_especial_unica_coincidencia,
            'factorProporcional': f"{factor_proporcional:.2f}",
            'factorCobertura': f"{factor_cobertura:.2f}",
            'cobertura': cobertura_porcentaje
        }


def mostrar_resultado(resultado):
    """
    Muestra el resultado de la afinidad en la consola
    
    Args:
        resultado (dict): Resultado del cálculo de afinidad
    """
    print("\n===== RESULTADO DE AFINIDAD =====")
    print(f"Nivel de afinidad: {resultado['nivel'].upper()}")
    print(f"Puntuación total: {resultado['puntuacion']}")
    print(f"Número de coincidencias: {resultado['coincidencias']}")
    print(f"Factor proporcional: {resultado['factorProporcional']}")
    print(f"Factor de cobertura: {resultado['factorCobertura']} (Cobertura: {resultado['cobertura']})")
    print(f"Nombres en Sujeto 1: {resultado['nombresSujeto1']}, Nombres en Sujeto 2: {resultado['nombresSujeto2']}")
    
    if resultado['casoUnicaCoincidencia']:
        print("\n¡CASO DE ÚNICA COINCIDENCIA!")
        print(f"Solo hay 1 coincidencia de nombre con {resultado['nombresSujeto1']} nombres en Sujeto 1.")
        print("La puntuación máxima está limitada a 3.0.")
    
    if resultado['casoEspecialUnicaCoincidencia']:
        print("\n¡CASO ESPECIAL!")
        print("Única coincidencia con valor 3 en Sujeto 1 y valor 1 en Sujeto 2. Afinidad reducida.")
    
    print("\n--- Nombres coincidentes ---")
    for item in resultado['nombresCoincidentes']:
        print(f"\n{item['nombre']}:")
        print(f"  Valor en Sujeto 1: {item['valorSujeto1']}, Valor en Sujeto 2: {item['valorSujeto2']}")
        
        # Mostrar detalles de cálculo
        if item['esCasoEspecial']:
            print(f"  CASO ESPECIAL: La única coincidencia tiene valoración 3-1.")
            print(f"  Valor reducido a {item['valorCalculado']} (sin factor proporcional)")
        elif item['esUnicaCoincidencia']:
            print(f"  ÚNICA COINCIDENCIA: {item['bonusText']}")
            print("  (máximo 3.0 puntos para única coincidencia)")
        else:
            print(f"  Base: {item['valorBase']} ({item['bonusText']})")
            if item['factorProporcional'] != "N/A" and float(item['factorProporcional']) > 1:
                print(f"  × {item['factorProporcional']} (factor) = {item['valorCalculado']}")
            else:
                print(f"  = {item['valorCalculado']}")
        
        # Mostrar tipo de coincidencia
        coincidencia_tipo = []
        if item['esCasoEspecial']:
            coincidencia_tipo.append("Caso Especial")
        if item['esUnicaCoincidencia']:
            coincidencia_tipo.append("Única Coincidencia")
        if item['esPremium']:
            coincidencia_tipo.append("Coincidencia Premium")
        if item['esValor2']:
            coincidencia_tipo.append("Coincidencia Valor 2")
        if item['esValoracionSuperior'] and not item['esCasoEspecial']:
            coincidencia_tipo.append("Valoración Superior")
        
        if coincidencia_tipo:
            print("  Tipo: " + ", ".join(coincidencia_tipo))


def main():
    """
    Función principal para ejecutar la calculadora de afinidad en modo consola
    """
    print("======== CALCULADORA DE AFINIDAD ========")
    print("\nBienvenido a la Calculadora de Afinidad\n")
    
    # Explicación del sistema de puntuación
    print("Sistema de puntuación:")
    print("- Empresa valor 3 + Alumno valor 3: 3.0 puntos (Coincidencia premium)")
    print("- Empresa valor 3 + Alumno valor 2: 2.0 puntos")
    print("- Empresa valor 3 + Alumno valor 1: 1.2 puntos")
    print("- Empresa valor 2 + Alumno valor 3: 1.8 puntos")
    print("- Empresa valor 2 + Alumno valor 2: 1.6 puntos (Coincidencia valor 2)")
    print("- Empresa valor 2 + Alumno valor 1: 1.0 puntos")
    print("- Empresa valor 1 + Alumno valor 3: 1.2 puntos")
    print("- Empresa valor 1 + Alumno valor 2: 1.1 puntos")
    print("- Empresa valor 1 + Alumno valor 1: 0.8 puntos")
    
    print("\nNotas importantes:")
    print("- Si solo hay 1 coincidencia con la empresa, la puntuación máxima es 3.0")
    print("- A menor cobertura de nombres (% de nombres coincidentes), menor puntaje")
    print("- Se valora más las coincidencias con etiquetas importantes para la empresa (valor 3)")
    
    calculadora = CalculadoraAfinidad()
    
    # Recolectar datos del Sujeto 1 (Empresa)
    print("\n--- Sujeto 1 (Empresa) - máximo 10 puntos ---")
    sujeto1 = {}
    continuar_sujeto1 = True
    total_puntos_sujeto1 = 0
    
    while continuar_sujeto1 and len(sujeto1) < 5 and total_puntos_sujeto1 < 10:
        nombre = input(f"Nombre {len(sujeto1) + 1} para Sujeto 1 (o dejar vacío para terminar): ").strip()
        if not nombre:
            continuar_sujeto1 = False
            continue
        
        while True:
            try:
                valor = int(input(f"Valor para '{nombre}' (1-3): "))
                if valor not in [1, 2, 3]:
                    print("El valor debe ser 1, 2 o 3.")
                    continue
                
                if total_puntos_sujeto1 + valor > 10:
                    print(f"No se puede añadir {valor} puntos. Quedan {10 - total_puntos_sujeto1} puntos disponibles.")
                    continue
                
                sujeto1[nombre] = valor
                total_puntos_sujeto1 += valor
                break
            except ValueError:
                print("Por favor, introduce un número válido.")
        
        print(f"Puntos totales: {total_puntos_sujeto1}/10")
    
    # Recolectar datos del Sujeto 2 (Alumno)
    print("\n--- Sujeto 2 (Alumno) - máximo 15 puntos ---")
    sujeto2 = {}
    continuar_sujeto2 = True
    total_puntos_sujeto2 = 0
    
    while continuar_sujeto2 and len(sujeto2) < 8 and total_puntos_sujeto2 < 15:
        nombre = input(f"Nombre {len(sujeto2) + 1} para Sujeto 2 (o dejar vacío para terminar): ").strip()
        if not nombre:
            continuar_sujeto2 = False
            continue
        
        while True:
            try:
                valor = int(input(f"Valor para '{nombre}' (1-3): "))
                if valor not in [1, 2, 3]:
                    print("El valor debe ser 1, 2 o 3.")
                    continue
                
                if total_puntos_sujeto2 + valor > 15:
                    print(f"No se puede añadir {valor} puntos. Quedan {15 - total_puntos_sujeto2} puntos disponibles.")
                    continue
                
                sujeto2[nombre] = valor
                total_puntos_sujeto2 += valor
                break
            except ValueError:
                print("Por favor, introduce un número válido.")
        
        print(f"Puntos totales: {total_puntos_sujeto2}/15")
    
    # Calcular afinidad
    if not sujeto1 or not sujeto2:
        print("\nAmbos sujetos deben tener al menos un nombre.")
        return
    
    resultado = calculadora.calcular_afinidad(sujeto1, sujeto2)
    mostrar_resultado(resultado)
    
    # Para probar el caso específico
    print("\n¿Quieres probar el caso específico? (a=1, b=3, c=3 y alumno solo a=3) [s/n]")
    respuesta = input().strip().lower()
    if respuesta == 's':
        caso_especifico_empresa = {'a': 1, 'b': 3, 'c': 3}
        caso_especifico_alumno = {'a': 3}
        resultado_caso = calculadora.calcular_afinidad(caso_especifico_empresa, caso_especifico_alumno)
        print("\n=== CASO ESPECÍFICO ===")
        mostrar_resultado(resultado_caso)


if __name__ == "__main__":
    main()
