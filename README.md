# Planner de Contenidos · GENIS RIVEROLA

Aplicación web ligera (HTML/CSS/JS) para calendarizar contenidos de Instagram, LinkedIn, TikTok y newsletter.

## Funcionalidades

- Calendarización mensual de contenidos.
- Registro detallado por pieza: guion, caption, CTA, y slides de carrusel.
- Pipeline de ejecución con:
  - filtro por plataforma,
  - vista de todo lo pendiente o solo "esta semana",
  - prioridades (alta/media/baja) con alertas visuales.
- Estados de flujo por pieza: `idea`, `grabando`, `editando`, `programado`, `publicado`.
- Registro de métricas por pieza publicada.
- Insights automáticos de engagement y rendimiento por plataforma.
- Persistencia local con `localStorage`.

## Uso

1. Abre `index.html` en tu navegador, o sirve el directorio con un servidor estático.
2. Crea una pieza desde el formulario y define estado + prioridad.
3. Revisa el pipeline usando filtros de plataforma y rango temporal.
4. En el detalle diario actualiza el estado según avance la producción.
5. Al pasar a `publicado`, registra métricas y consulta insights.
