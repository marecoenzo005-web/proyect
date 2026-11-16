# Nexora Digital — soluciones digitales para pymes (demo)

Sitio de una sola página sobre servicios digitales para pequeñas y medianas empresas de Argentina. Está pensado como demo educativa y comercial: muestra qué hace Nexora Digital, cómo se explican los servicios, una calculadora de escenarios y una guía Premium con plantillas y material de trabajo.

No es un sistema de cuentas ni de pagos reales. El acceso es una simulación local.

## Secciones

1. **Inicio / hero**: posicionamiento para pymes, problemas frecuentes y cómo se relacionan con cada solución.
2. **Servicios**: seis servicios (web, automatizaciones, chatbot con IA, seguimiento de presupuestos, atención ordenada y mantenimiento). Cada uno incluye problema, alcance, tipo de negocio, ejemplo y precio orientativo en ARS.
3. **Guía**: 7 pasos de inicio con tiempos y costos orientativos, adaptados al contexto argentino (CUIT, monotributo, ARCA, Ley 25.326 y Ley 24.240).
4. **Claves**: seis principios prácticos sobre nicho, alcance, recurrencia, medición, caja/impuestos y procesos.
5. **Calculadora**: cinco variables ajustables y siete resultados estimados. Incluye explicación de MRR, CAC, LTV y punto de equilibrio con fórmulas y ejemplos.
6. **Premium**: se desbloquea con un correo en modo demo. Contiene 8 ideas de negocio con 7 campos cada una, guía desde cero, herramientas, 7 plantillas editables, guiones de venta, objeciones, plan de 90 días en tres etapas, precios orientativos, auditoría exprés, economía/legal y 6 KPIs.
7. **Pie**: recordatorio de que se trata de una demo front-end.

## Cómo abrirla

- **Doble clic en `index.html`**: funciona sin servidor ni instalación.
- Opcional, para servirla en local desde esta carpeta:

  ```bash
  npx serve .
  # o
  python -m http.server 8000
  ```

## Acceso demo

No hay credenciales reales: **cualquier usuario y cualquier contraseña no vacíos** permiten entrar.

- Con «Mantener sesión iniciada» marcado, la sesión se guarda en `localStorage`.
- Sin marcar, se usa `sessionStorage` y se pierde al cerrar la pestaña.
- Solo se guarda `{ user, at }`; **nunca se almacena la contraseña**.
- El botón **Salir** borra la sesión.

## Premium: cómo funciona el desbloqueo

- No hay backend, cobro ni envío de correos. La validación es de formato y ocurre en el navegador.
- Al desbloquear, el correo se guarda en `localStorage` bajo la clave `nexora.premium.v1` como `{ email, at }`.
- En visitas siguientes, si la clave existe y el correo es válido, la guía aparece desbloqueada.
- **Usar otro correo** borra esa clave y vuelve a mostrar el formulario.
- Si el navegador bloquea `localStorage`, el contenido queda disponible solo para la visita actual.
- El botón **Imprimir guía** abre la impresión del navegador.

## Precios y contexto argentino

- Todos los precios visibles son **orientativos**, en pesos argentinos (ARS) y no incluyen impuestos.
- Las referencias fiscales y legales son educativas: CUIT, inscripción, monotributo y facturación electrónica en ARCA (ex-AFIP) deben confirmarse con un contador. La Ley 25.326 regula datos personales y la Ley 24.240 aplica en relaciones de consumo.
- La calculadora y el simulador Premium usan supuestos matemáticos. No son proyecciones garantizadas ni promesas de ingresos.

## Archivos

```text
index.html   Estructura, login demo, secciones y contenido Premium
styles.css   Diseño, componentes, responsive, accesibilidad e impresión
app.js       Login demo, calculadora, simulador Premium, copia de plantillas y UI
README.md    Esta documentación
```

## Personalización rápida

- **Colores y tipografía**: variables al inicio de `styles.css` (`:root`).
- **Marca y textos**: busca «Nexora» en `index.html`.
- **Precios y rangos de la calculadora**: atributos `min`, `max`, `step` y `value` de los inputs en `#numeros`.
- **Fórmulas de la calculadora**: `setupCalculator()` en `app.js`.
- **Simulador Premium**: IDs `pRetainers`, `pPrice`, `pSetup`, `pNew` y `setupPremiumEstimator()` en `app.js`.
- **Contenido Premium**: sección `#premium` en `index.html`.
- **Plantillas editables**: bloques `<textarea>` con IDs `tpl-*` y botones `data-copy-target`.
- **Clave del correo Premium**: constante `PREMIUM_KEY` en `app.js` (`nexora.premium.v1`).
- **Integración futura**: objeto `NEXORA_CONFIG` al inicio de `app.js` (`demoMode`, `authEndpoint`, `premiumEndpoint`, `paymentsEndpoint`). También queda expuesto en `window.NexoraDemo.config`.

## Seguridad y límites

- El login y el desbloqueo Premium son **solo de interfaz**. Cualquiera puede saltarlos leyendo el código o editando `localStorage`.
- No se guardan contraseñas, datos sensibles ni tokens. No se procesa ningún pago.
- Para producción hace falta un backend con autenticación real (hash de contraseñas, HTTPS, sesiones o tokens seguros), control de permisos, validación del correo en servidor y una pasarela de pagos. En ese escenario no conviene guardar tokens sensibles en `localStorage`.
- El contenido legal y fiscal es educativo y no reemplaza el asesoramiento de un contador o abogado.
