# 🐾 Houndxpress — Sistema de Trazabilidad y Gestión Logística Transfronteriza

> **Proyecto Capstone Full Stack Python (EBAC × Hound Express)**  
> Plataforma web integral para el control de guías, automatización del flujo de estados logísticos y reducción de pérdidas operativas en envíos e-commerce México – EE. UU.

---

## 📌 Contexto y Problema Negocial

**Hound Express** es una empresa especializada en soluciones logísticas e importación para e-commerce y comercio internacional entre México y Estados Unidos.

### 🔴 Problemática Identificada
Actualmente, la operación enfrenta fallas críticas en la secuencia de seguimiento de carga:
- **Inconsistencia de procesos**: Un **69% de las guías** no siguen la secuencia logística requerida o registran saltos de etapas con fechas extemporáneas. Solo el **31%** cumple el flujo ordenado.
- **Impacto Financiero**: Generación de hasta **$200,000 MXN en sobrecostos** y pérdidas operativas directas por errores humanos derivados de la carga de trabajo manual.
- **Falta de Trazabilidad**: Ausencia de un historial centralizado para análisis de datos y auditoría en tiempo real.

### 🟢 Solución Propuesta
Desarrollo de una solución **Full Stack Python** que valida sistemáticamente el orden lógico del flujo de estados y centraliza la consulta e historial de cada paquete.

---

## 🔄 Flujo Logístico Obligatorio (5 Etapas)

El sistema valida que cada guía avance estrictamente en la secuencia definida:

1. 📦 **Recepción de carga** `[Aduana]`
2. 🚚 **Vehículo cargado** `[Aduana]`
3. 🏢 **Vehículo liberado** `[Operaciones]`
4. 🛣️ **Vehículo en camino** `[Seguridad]`
5. ✅ **Carga entregada** `[KAM]`

---

## 🛠️ Arquitectura y Stack Tecnológico

### **Frontend**
- **React 18** + **TypeScript** — Componentes tipados y modulares.
- **Redux / Redux Toolkit** — Gestión del estado global de las guías.
- **SASS / BEM** — Estilos estructurados y responsivos.
- **Jest** — Pruebas unitarias e integración de la interfaz.

### **Backend**
- **Python 3.12** + **Django 5.x** + **Django REST Framework (DRF)**
- **API RESTful** — Endpoints estructurados (`GET`, `POST`, `PUT`) para la gestión de guías.
- **Base de Datos** — PostgreSQL / SQLite con ORM de Django y migraciones estrictas.

---

## 📋 Estado Real del Proyecto y Roadmap

| Módulo / Funcionalidad | Estado | Descripción |
| :--- | :---: | :--- |
| **Estructura Git & CLI** | ✅ Operativo | Repositorio remoto sincronizado con `gh` y estructura base |
| **API REST (Guías)** | 🟡 En Desarrollo | Endpoints para alta (`POST`), consulta (`GET`) y actualización (`PUT`) |
| **Validación de Flujo** | 🟡 En Desarrollo | Máquina de estados para impedir saltos de etapas logísticas |
| **Frontend React + TS** | 🔲 Pendiente | Interfaz para usuarios y panel operativo |
| **Redux State Management** | 🔲 Pendiente | Manejo del flujo de información inter-componentes |
| **Pruebas con Jest** | 🔲 Pendiente | Cobertura unitaria de componentes e interacciones |

---

## ⚡ Inicio Rápido (Setup Local)

### 1. Clonar el repositorio
git clone [https://github.com/pipeTawns-x/Houndxpress.git](https://github.com/pipeTawns-x/Houndxpress.git)
cd Houndxpress

### 2. Configurar el entorno de Backend (Python/Django)
python3 -m venv venv
source venv/bin/activate
pip install django djangorestframework django-cors-headers

---

## 🔒 Seguridad y Buenas Prácticas
- **Variables de entorno (`.env`)**: Secretos y claves de API aislados del repositorio.
- **Validaciones de negocio**: Cero saltos de estado sin autenticación ni orden cronológico verificado.
- **Control de Versiones**: Commits semánticos y reglas en `.gitignore` para entornos locales.

---

## 👥 Créditos y Alianza
- **Desarrollador Lead**: Felipe (@pipeTawns-x)
- **Programa**: Profesional en Desarrollo Full Stack Python — **EBAC**
- **Socio Logístico**: **Hound Express** (México / EE. UU.)
