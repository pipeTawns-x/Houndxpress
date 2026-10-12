# Fase 0 — Entorno local, AWS y MCP

## Alcance y estado de la evidencia

Esta guía prepara el entorno de Eduardo; no autoriza despliegues ni el inicio de la fase 1. Se basa en los datos oficiales ya verificados y suministrados por la tarea padre. El agente redactor no ejecutó los comandos, no verificó las versiones locales y no modificó la configuración personal.

**Versiones reportadas por Eduardo, NO VERIFICADAS por este agente:** AWS CLI 2.37.12; SAM CLI 1.168; Podman 6.1.3; Trivy 0.75; Semgrep 1.180; Checkov 3.3.20; Syft 1.54.1; Cosign 3.1.3. Son antecedentes, no resultados de esta guía ni versiones fijadas como requisito.

## 1. Bloque inicial único para Eduardo — no ejecutado por el agente

Antes de copiarlo, confirme que el repositorio y la rama actuales corresponden a `houndxpress-practicas` / `practicas-ebac`, que desea publicar esa rama y que `aws-docs` y `playwright` no están ya registrados en Codex. Si alguno existe, omita su línea de alta y revise la entrada existente; no la duplique ni sobrescriba. Se presupone que `uvx`, `npx`, Codex y las herramientas reportadas están disponibles: este bloque no instala dependencias del proyecto.

Los comandos `codex mcp add` son la **única vía elegida aquí** para registrar los dos servidores iniciales. No repita esas altas mediante TOML. El bloque puede descargar los paquetes MCP al registrarlos o utilizarlos; no ejecuta `npm ci`, pruebas ni despliegues.

```bash
cd ~/Desktop/houndxpress-practicas || exit 1
git push origin practicas-ebac || exit 1

aws --version
sam --version
podman --version
trivy --version
semgrep --version
checkov --version
syft version
cosign version

podman machine list
podman machine inspect podman-machine-default >/dev/null 2>&1 || podman machine init podman-machine-default
if [ "$(podman machine inspect podman-machine-default --format '{{.State}}')" = "running" ]; then
  printf '%s\n' 'La máquina Podman ya está en ejecución; no se vuelve a iniciar.'
else
  podman machine start podman-machine-default || exit 1
fi
podman info

codex mcp add playwright -- npx -y @playwright/mcp@latest --isolated --headless
codex mcp add aws-docs --env FASTMCP_LOG_LEVEL=ERROR --env AWS_DOCUMENTATION_PARTITION=aws -- uvx awslabs.aws-documentation-mcp-server@latest
codex mcp list
```

Si falla un comando, detenga la secuencia y revise el error; no interprete las líneas posteriores como evidencia de éxito. Conserve las salidas localmente, sin publicar secretos ni datos de cuenta.

Fuentes: [registro MCP mediante Codex CLI](https://learn.chatgpt.com/docs/extend/mcp?surface=cli), [Playwright MCP oficial](https://github.com/microsoft/playwright-mcp) y [AWS Documentation MCP oficial](https://github.com/awslabs/mcp/tree/main/src/aws-documentation-mcp-server).

## 2. Configuración MCP y límites

- **AWS Documentation:** comando `uvx`, argumento `awslabs.aws-documentation-mcp-server@latest`, entorno `FASTMCP_LOG_LEVEL=ERROR` y `AWS_DOCUMENTATION_PARTITION=aws`. Su función en esta fase es consultar documentación, no operar recursos de la cuenta. [Fuente oficial](https://github.com/awslabs/mcp/tree/main/src/aws-documentation-mcp-server).
- **Playwright:** comando `npx`, argumentos `-y`, `@playwright/mcp@latest`, `--isolated`, `--headless`. Se utiliza un contexto aislado y sin ventana visible; esto no constituye por sí solo una frontera de seguridad para navegación o acciones. [Fuente oficial](https://github.com/microsoft/playwright-mcp).
- **AWS API MCP:** está deprecado; **no instalarlo** ni añadirlo como alternativa. [Aviso oficial](https://awslabs.github.io/mcp/servers/aws-api-mcp-server).

**Riesgo explícito de `@latest`:** no fija una versión. Una ejecución futura puede resolver un paquete distinto y cambiar comportamiento o dependencias. Se conserva por la instrucción de esta fase, sin afirmar reproducibilidad ni estabilidad entre ejecuciones. Antes de adoptar una versión fija, revise la publicación oficial correspondiente.

La configuración personal se encuentra en `~/.codex/config.toml`. Si posteriormente se edita manualmente, **combine solamente las tablas nuevas**: no reemplace el archivo completo, no duplique tablas existentes y mantenga intactos `engram`, `pencil` y `context7`. Para `aws-docs` y `playwright`, use exclusivamente las altas CLI del bloque anterior; no se incluye una segunda receta TOML. [Referencia de configuración MCP de Codex](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).

**Secretos:** no escribir credenciales, claves de acceso, tokens ni material de sesión en configuración MCP, repositorio, documentación o chat. No copiar el contenido de los archivos de caché SSO. El perfil posterior identifica una configuración local; no debe contener credenciales pegadas en esta guía.

## 3. Cuenta AWS — decisiones manuales previas

### 3.1 Proteger root

Active MFA para el usuario root y no cree claves de acceso root. Reserve root para operaciones que realmente lo requieran; no lo utilice para el MCP ni para trabajo cotidiano. [Buenas prácticas oficiales para root](https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html).

### 3.2 Elegir Free o Paid ANTES de Organizations

Elija conscientemente el plan de cuenta antes de crear o unirse a una organización:

- **Free:** dura hasta seis meses o hasta agotar los créditos, lo que ocurra primero; al finalizar, la cuenta se cierra conforme a las condiciones del plan. No asumir que continuará operativa indefinidamente.
- **Paid:** implica aceptar la facturación aplicable; no equivale a un límite de gasto garantizado.
- Crear una organización o unirse a AWS Organizations convierte automáticamente la cuenta al plan **Paid**.

Por tanto, esta guía **no propone crear Organizations ni habilitar SSO para acceso a cuentas mientras Eduardo no acepte explícitamente Paid**. Mantener Free deja pendiente ese camino SSO, pero permite el acceso local mediante `aws login` descrito en la sección 4. [Planes oficiales de AWS Free Tier](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-plans.html).

Una instancia de IAM Identity Center de tipo **account** sirve para aplicaciones compatibles, **no para acceso SSO a cuentas AWS**. No es un atajo para obtener ese acceso sin Organizations. [Tipos de instancia oficiales de IAM Identity Center](https://docs.aws.amazon.com/singlesignon/latest/userguide/identity-center-instances.html).

### 3.3 Seleccionar la región

Eduardo debe elegir y registrar la región de trabajo antes de ejecutar los comandos AWS posteriores. No se presume una región por cercanía, por defecto local ni por un ejemplo. Al configurar SSO, distinga la región de IAM Identity Center de la región de trabajo predeterminada de AWS CLI; complete ambas según la cuenta real. [Configuración oficial de SSO con AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html).

### 3.4 Presupuesto y correo

En AWS Budgets, configure manualmente un presupuesto de costos **mensual de 5 USD**. Añada dos alertas de costo real con umbrales **absolutos**, no porcentuales: **1 USD** y **5 USD**. Configure un correo de notificación verificado y confirme cualquier suscripción requerida antes de dar las alertas por operativas.

**Las alertas no son un límite duro de gasto:** no bloquean automáticamente el consumo ni garantizan detener cargos exactamente en esos importes. Revise su configuración y el estado de entrega del correo. [Creación oficial de presupuestos y notificaciones](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-create.html).

## 4. Acceso local Free con `aws login`

AWS CLI 2.32.0 o posterior permite acceso local con credenciales temporales mediante autenticación en el navegador, sin llaves permanentes ni Organizations. Eduardo debe preparar un usuario IAM con MFA y permisos mínimos; nunca usar root. La identidad necesita `SignInLocalDevelopmentAccess` para autenticarse y permisos separados de lectura para los servicios autorizados. Esa política de inicio de sesión no sustituye los permisos de servicio.

Con usuario, MFA, región y presupuesto preparados, Eduardo ejecuta:

```bash
aws login --profile houndxpress-readonly
aws sts get-caller-identity --profile houndxpress-readonly
```

Verifique localmente la identidad y reporte solo si corresponde al usuario esperado. No comparta códigos, tokens, URLs de autorización ni cachés. Las credenciales se renuevan durante una sesión de hasta 12 horas según el principal; después hay que iniciar sesión otra vez. SDK antiguos pueden necesitar adaptación posterior. Este flujo no crea recursos ni requiere cambiar a Paid.

Fuente: [autenticación local oficial de AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sign-in.html).

### Alternativa posterior Paid: IAM Identity Center

**No ejecutar ahora.** Requisitos previos, todos obligatorios:

1. Eduardo aceptó explícitamente Paid antes de cualquier paso que implique Organizations y acceso SSO a cuentas.
2. La cuenta tiene el acceso a cuentas mediante IAM Identity Center correctamente preparado; no se confunde con una instancia de tipo account para aplicaciones.
3. Se seleccionaron la región de trabajo y la región real de Identity Center; se configuró el presupuesto y su correo.
4. Existe una asignación SSO con un **permission set personalizado de lectura mínima**, respaldado por un rol de acceso a cuenta. Sus acciones y recursos deben responder únicamente a las consultas aprobadas. No usar `AdministratorAccess`, permisos de escritura ni acceso administrativo como solución provisional.

El perfil local se llamará **`houndxpress-readonly`**. No se incluye una política comodín ni se afirma que `--readonly` sustituya los permisos IAM: la restricción debe existir también en el permission set/rol. La selección exacta de acciones queda pendiente de las consultas que Eduardo autorice. [Referencia oficial de IAM MCP](https://github.com/awslabs/mcp/tree/main/src/iam-mcp-server).

Solo después de cumplir esos requisitos, Eduardo podrá ejecutar, en este orden:

```bash
aws configure sso --profile houndxpress-readonly
aws sso login --profile houndxpress-readonly
aws sts get-caller-identity --profile houndxpress-readonly
```

Complete los campos con valores reales de su configuración SSO y la región elegida. Compruebe localmente que la identidad corresponde a la cuenta y al rol de lectura esperados. No publique la salida de identidad ni tokens en el chat. Estos comandos configuran/autentican el perfil y consultan la identidad; no son un despliegue. [Guía oficial de autenticación SSO de AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html).

## 5. Plantilla IAM MCP diferida — conservar deshabilitada

Esta es la única plantilla TOML de la guía. **No aplicarla ni activarla durante la preparación inicial.** Cuando corresponda, combinarla como tabla nueva en `~/.codex/config.toml`, solo si no existe ya `[mcp_servers.aws-iam]`; si existe, revisar y combinar esa entrada sin duplicarla. Preservar `engram`, `pencil`, `context7` y los servidores registrados por CLI.

```toml
[mcp_servers.aws-iam]
enabled = false
command = "uvx"
args = ["awslabs.iam-mcp-server@latest", "--readonly"]

[mcp_servers.aws-iam.env]
AWS_PROFILE = "houndxpress-readonly"
```

Mantener `enabled = false` hasta disponer de SSO funcional, identidad comprobada y permission set/rol personalizado de lectura mínima. Habilitarlo requerirá una decisión posterior explícita; **esta guía no autoriza cambiarlo a `true`**. No añadir claves de acceso al entorno del servidor. También aquí `@latest` implica el riesgo de versión no fijada. [Servidor IAM MCP oficial](https://github.com/awslabs/mcp/tree/main/src/iam-mcp-server) y [configuración MCP de Codex](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).

## 6. Cierre de fase 0

La preparación local se documenta con las salidas reales de las ocho versiones, `podman info` y `codex mcp list`; las versiones reportadas previamente no sustituyen esa evidencia. No repetir pruebas del proyecto ni ejecutar `npm ci` para esta tarea.

El estado AWS puede permanecer **pendiente** por decisión de plan, región, presupuesto o SSO. No declarar IAM operativo mientras esté diferido. No realizar despliegues ni avanzar a fase 1 con esta guía.
