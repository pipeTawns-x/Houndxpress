# Fase 2 — Verificación AWS y recursos con capa gratuita

**Fecha de consulta:** 2026-10-12.  
**Documento contrastado:** `/Users/felipeeduardotorresaguilar/Desktop/houndxpress-practicas/docs/loops/05-LOOP-CODEX.md`, apéndices C y E.

**Alcance:** investigación documental mediante AWS Documentation MCP y web oficial. Sin despliegues, instalaciones, cambios de archivos, acceso a cuentas ni lectura de secretos. **Verificado** significa respaldo documental, no prueba operativa ni elegibilidad comprobada de la cuenta.

## 1. AWS — Apéndice C

| Afirmación | Veredicto y precisión | Fuente primaria | Fecha | Riesgo |
|---|---|---|---|---|
| CloudFront: 1 TB y 10 millones de solicitudes/mes sin cargo | **Correcto solo para Free Tier de pay-as-you-go**, agregado por cuenta. Excedentes y otros servicios se facturan por separado. No garantiza frontend completo sin costo. | [CloudFront FAQ](https://aws.amazon.com/cloudfront/faqs/) | 12-oct-2026 | Alto: confundir cuota con límite de gasto. |
| CloudFront Free flat-rate equivale a esas cuotas | **Falso.** Incluye 100 GB y 1 millón de solicitudes/mes por plan/distribución. No cobra excedentes de tráfico, pero puede ajustar la entrega por exceso sostenido. | [Planes CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/flat-rate-pricing-plan.html) | 12-oct-2026 | Alto: mezclar modelos comerciales. |
| CloudFront Free flat-rate está disponible para una cuenta AWS Free | **No.** La documentación indica que las cuentas Free Tier no pueden usar los planes flat-rate. Son dos conceptos distintos de “Free”. | [Requisitos de cuenta](https://docs.aws.amazon.com/PricingPlanManager/latest/UserGuide/plans.html) | 12-oct-2026 | Alto: arquitectura basada en una oferta no elegible. |
| Lambda: 1 millón de solicitudes y 400.000 GB-s/mes | **Verificado**, como franquicias mensuales. No cubren automáticamente ECR, logs, red ni todas las modalidades de Lambda. | [Precios Lambda](https://aws.amazon.com/lambda/pricing/) | 12-oct-2026 | Alto: costos auxiliares y excedentes. |
| Django puede ejecutarse con Lambda Web Adapter | **Respaldado documentalmente.** Adapta aplicaciones HTTP; el repositorio oficial enlaza un ejemplo Django. La integración específica de Hound no se probó. “Se enciende con cada petición” es una simplificación, no una garantía de arranque nuevo. | [Repositorio oficial](https://github.com/aws/aws-lambda-web-adapter) | 12-oct-2026 | Medio: inicialización, servidor HTTP y conexiones. |
| Lambda no impone límites relevantes al backend | **Incorrecto.** El timeout convencional documentado es 900 segundos. Otras cuotas y valores efectivos de la cuenta quedan pendientes. | [Cuotas Lambda](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html) | 12-oct-2026 | Medio: operaciones largas. |
| `S3OriginAccessControl` sirve para S3 privado | **Verificado.** Existe en CDK Python; `S3BucketOrigin.with_origin_access_control` integra OAC. No confundir el construct específico S3 con el OAC de Lambda. | [CDK: S3OriginAccessControl](https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_cloudfront/S3OriginAccessControl.html), [orígenes S3](https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_cloudfront_origins/README.html) | 12-oct-2026 | Medio: política del bucket/configuración incorrecta. |
| OAC con Lambda exige hash del cuerpo en POST/PUT | **Verificado.** El cliente debe enviar SHA-256 en `x-amz-content-sha256`. Function URL requiere `AWS_IAM`; la guía contempla permisos `lambda:InvokeFunctionUrl` y `lambda:InvokeFunction`. | [OAC para Lambda](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-lambda.html) | 12-oct-2026 | Alto: fallos de firma y permisos. |
| OAC no afecta la autenticación propia de la API | **Incorrecto.** `always` puede sustituir `Authorization`; `no-override` exige una firma SigV4 válida para Lambda, no simplemente un bearer token. Web Adapter ofrece `AWS_LWA_AUTHORIZATION_SOURCE`; integración pendiente. | [OAC Lambda](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-lambda.html), [Web Adapter](https://github.com/aws/aws-lambda-web-adapter) | 12-oct-2026 | Alto: conflicto con JWT/sesiones. |
| API Gateway HTTP o cabecera secreta son alternativas equivalentes | **Pendiente.** No se verificaron costos, controles ni protección contra acceso directo. No quedan aprobadas como sustitutos de OAC. | [Referencia contrastada de OAC](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-lambda.html) | 12-oct-2026 | Alto: bypass del origen. |
| Lambda en VPC solo puede salir a internet mediante NAT Gateway | **Demasiado absoluto.** Una subred pública no le proporciona internet; para IPv4 la guía usa NAT. Existe salida IPv6 mediante egress-only gateway cuando los destinos y subredes lo soportan. | [Conectividad Lambda](https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc-internet.html) | 12-oct-2026 | Alto: dependencia de conectividad. |
| NAT Gateway cuesta cada mes | **Correcto con precisión:** cobra por hora disponible y GB procesado. El ejemplo oficial usa USD 0,045/h y USD 0,045/GB; no es tarifa universal. | [Precios VPC](https://aws.amazon.com/vpc/pricing/) | 12-oct-2026 | Alto: costo aun sin solicitudes. |
| Free y Paid son intercambiables sin consecuencias | **Falso.** Free termina a los seis meses o al consumir créditos, lo primero que ocurra; después cierra automáticamente. La adhesión a Organizations figura como disparador de conversión automática a Paid. | [Planes de cuenta AWS](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-plans.html) | 12-oct-2026 | Alto: continuidad y cambio de facturación. |
| `aws login` evita llaves permanentes para desarrollo local | **Verificado.** CLI ≥2.32.0, identidad de consola y permiso `SignInLocalDevelopmentAccess`. Renueva credenciales durante una sesión de hasta 12 horas; luego exige nuevo login. MFA y permisos mínimos deben configurarse, no asumirse. | [AWS CLI login](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sign-in.html) | 12-oct-2026 | Medio: permisos y expiración. |
| Plan Paid implica usar IAM Identity Center | **No demostrado como obligación.** AWS distingue su autenticación mediante SSO de `aws login`; disponibilidad y modalidad aplicables quedan pendientes. | [Autenticación local](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sign-in.html) | 12-oct-2026 | Medio: decisión de identidad prematura. |
| SSM SecureString significa secretos sin costo | **Parcial.** Parámetros Standard y throughput estándar no tienen cargo adicional de Parameter Store. Advanced y mayor throughput sí. Costos KMS y condiciones de SecureString pendientes. | [Precios Systems Manager](https://aws.amazon.com/systems-manager/pricing/) | 12-oct-2026 | Medio: cargos de cifrado/API. |
| Bedrock tiene precio por token y puede darse por gratuito | **Precio verificado; gratuidad no.** Inferencia on-demand depende del modelo y tokens de entrada/salida. Permisos del rol, disponibilidad y elegibilidad de Hound pendientes. | [Precios Bedrock](https://aws.amazon.com/bedrock/pricing/) | 12-oct-2026 | Alto: consumo variable. |
| SAM o CDK “en Python” | **Precisar.** CDK permite definir infraestructura en Python; SAM utiliza plantillas declarativas y puede ejecutar aplicaciones Python. Sin cargo adicional por las herramientas, pero sí por recursos creados. | [Comparación oficial SAM/CDK](https://aws.amazon.com/compare/cdk-and-sam/) | 12-oct-2026 | Medio: confundir herramienta con infraestructura gratuita. |
| GitHub Actions OIDC evita llaves AWS duraderas | **Verificado.** Requiere restringir confianza mediante `aud` y `sub`. La documentación actual incorpora IDs inmutables en ciertos repositorios nuevos; no copiar una política sin contrastar el formato aplicable. | [OIDC GitHub–AWS](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws) | 12-oct-2026 | Alto: confianza excesiva. |
| RDS, Budgets, CloudTrail, Turnstile y contenedores/EKS | **Pendientes de contraste completo.** No se valida la generalización sobre los 12 meses de RDS, costos auxiliares, configuración de seguridad ni precios EKS. | — | 12-oct-2026 | Alto: no usarlos como supuestos cerrados. |

## 2. Recursos — contraste con itsfree.dev

[itsfree.dev](https://itsfree.dev/) se utilizó como catálogo, **no como autoridad de precios**. Un candidato por categoría; ninguno constituye decisión de adopción.

| Categoría / candidato | Afirmación y veredicto | Fuente oficial | Fecha | Riesgo |
|---|---|---|---|---|
| Auth — Clerk | Hobby: **50.000 MRU por aplicación y 3 puestos de dashboard**, no los 5 indicados por el catálogo. MRU no equivale a MAU; MFA aparece en Pro. | [Clerk Pricing](https://clerk.com/pricing) | 12-oct-2026 | Alto: requisito MFA y cambio de plan. |
| Email — Resend | **3.000 correos/mes y 100/día verificados.** No trasladar automáticamente al plan actual los demás límites del catálogo. | [Resend Pricing](https://resend.com/pricing) | 12-oct-2026 | Medio: techo diario y entregabilidad. |
| Monitorización — Grafana Cloud | Free: **10.000 series activas, 50 GB de logs ingeridos/mes y retención de 14 días** verificados. No confundir con Pro y sus excedentes facturables. | [Grafana Pricing](https://grafana.com/pricing/) | 12-oct-2026 | Medio: cardinalidad, retención y datos sensibles. |
| CI/CD — GitHub Actions | Runners estándar sin cargo en repos públicos. GitHub Free privado: **2.000 minutos/mes y 500 MB de artefactos**, compartidos con Packages. Runners grandes se cobran incluso en públicos. | [Facturación Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions) | 12-oct-2026 | Alto: runner, almacenamiento y excedentes. |
| Storage — Supabase | Candidato transversal del catálogo: **1 GB de storage, 5 GB de egress cacheado y archivos de hasta 50 MB** verificados para Free. No implica capacidad ilimitada ni continuidad garantizada. | [Supabase Pricing](https://supabase.com/pricing) | 12-oct-2026 | Medio: transferencia, tamaño y disponibilidad. |
| APIs — IPQuery | Candidato localizado y sitio oficial consultado. **Cuota exacta y condiciones de uso: NO VERIFICADAS.** No clasificar como API ilimitada ni garantía antifraude. | [IPQuery](https://ipquery.io/) | 12-oct-2026 | Alto: límites y tratamiento de IP. |
| Analítica — Ahrefs Web Analytics | **Hasta 1 millón de eventos por proyecto/mes** sin cargo documentado. Retención, verificación del proyecto y condiciones de privacidad quedan pendientes. | [Ahrefs Web Analytics](https://ahrefs.com/web-analytics) | 12-oct-2026 | Medio: cuota y privacidad. |

## 3. Implicación para arquitectura

El apéndice C **no está listo para aprobarse sin correcciones**. Los puntos críticos son separar los tres conceptos de Free —cuenta AWS, franquicia CloudFront PAYG y plan CloudFront flat-rate—, resolver autenticación de API frente a OAC y contabilizar servicios auxiliares.

Los pendientes permanecen abiertos; este informe **no recomienda gasto, cambio de plan ni despliegue**.

## Key Learnings:

1. Una franquicia de consumo no equivale a un límite duro de gasto.
2. OAC protege el origen, pero no sustituye la autenticación de usuarios de Hound.

---

**Nota operativa:** Engram aceptó un registro de hallazgos y el resumen de sesión exigidos por las instrucciones superiores, pese a la suspensión de escrituras reportada. No se modificaron archivos del proyecto.
