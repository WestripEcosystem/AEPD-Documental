# Landing one-page · Genís Riverola

Este repositorio incluye una landing one-page en el archivo `index.html`.

## ¿Dónde está la carpeta del proyecto?

La carpeta del proyecto es esta misma raíz del repositorio:

- En este entorno: `/workspace/AEPD-Documental`
- En GitHub: cuando clonas el repo, la carpeta local que se crea (por ejemplo `AEPD-Documental/`)

## Estructura mínima que necesitas tocar

- `index.html`: contiene todo (HTML + estilos CSS en línea).
- `README.md`: esta guía de uso.

## Ver la web en local (vista previa)

### Opción rápida (recomendada)

1. Abre una terminal.
2. Entra en la carpeta del proyecto.
3. Levanta un servidor local.
4. Abre el navegador.

Comandos:

```bash
cd /ruta/a/AEPD-Documental
python -m http.server 8000
```

Después abre:

- `http://localhost:8000`
- o `http://localhost:8000/index.html`

> Para parar el servidor: `Ctrl + C`.

---

## Iterar y modificar la web

### 1) Editar contenido y diseño

Abre `index.html` con tu editor (VS Code, Cursor, etc.) y modifica:

- Textos de secciones (`Hero`, `Sobre mí`, `Resultados`, `Servicios`, `Filosofía`, `Contacto`).
- Estilos CSS dentro de la etiqueta `<style>` (colores, espaciados, tipografías, etc.).

### 2) Guardar y recargar

Con el servidor local en marcha, guarda cambios y recarga el navegador.

### 3) Subir cambios a GitHub (opcional)

```bash
git add index.html README.md
git commit -m "Ajustes de contenido/diseño landing"
git push
```

---

## Sugerencias para cambios rápidos

- **Color principal**: busca `--accent` en el bloque `:root`.
- **Ancho máximo**: busca `--max`.
- **Sección de contacto**: al final del documento, bloque `id="contacto"`.
- **Navegación**: bloque `<nav class="menu">`.

## Nota

El formulario de contacto está maquetado en frontend. Si quieres envío real de mensajes, hay que conectarlo a un backend o servicio de formularios.
