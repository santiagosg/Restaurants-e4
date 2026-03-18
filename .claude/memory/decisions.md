# Architecture Decisions - Restaurants-e4

Este documento registra las decisiones arquitectónicas importantes tomadas durante el desarrollo del proyecto.

## Formato ADR

```markdown
# ADR-{number}: {title}

## Status
{Proposed | Accepted | Rejected | Superseded}

## Context
{Describe the problem or situation that motivated the decision}

## Decision
{Describe the chosen solution}

## Consequences
{Describe positive and negative impacts}

## Alternatives Considered
- {alternative 1}
- {alternative 2}
```

---

## Decisiones Registradas

### ADR-001: Uso de NestJS Framework

**Status:** Accepted
**Fecha:** 2024-03-18

**Context:**
Se requiere un framework backend robusto y escalable para la API de restaurantes. El proyecto debe soportar arquitectura modular, inyección de dependencias, y buena documentación.

**Decision:**
Seleccionar NestJS como framework principal del proyecto.

**Consecuencias:**

**Positivas:**
- Arquitectura modular por defecto
- Soporte nativo de TypeScript
- Inyección de dependencias incorporada
- Excelente integración con Swagger
- Gran comunidad y documentación
- Compatible con Express subyacente

**Negativas:**
- Curva de aprendizaje inicial
- Verbosidad en configuraciones
- Overhead para proyectos muy pequeños

**Alternativas Consideradas:**
- Express.js: Más minimalista pero sin estructura por defecto
- Fastify: Más rápido pero menos comunidad
- Koa: Basado en async/await pero menos popular

---

### ADR-002: Uso de Prisma ORM

**Status:** Accepted
**Fecha:** 2024-03-18

**Context:**
Se requiere un ORM moderno que proporcione type safety, migraciones, y buena experiencia de desarrollo para PostgreSQL.

**Decision:**
Seleccionar Prisma ORM para acceso a datos.

**Consecuencias:**

**Positivas:**
- Type safety completo con TypeScript
- Schema declarativo
- Migraciones versionadas
- Prisma Studio para visualización
- Excelente DX
- Buen performance

**Negativas:**
- Schema file puede crecer en proyectos grandes
- Alguna limitación en queries complejos
- Dependencia de binario Rust

**Alternativas Consideradas:**
- TypeORM: Más maduro pero menos type-safety
- MikroORM: Unit of Work pattern
- Knex.js: Query builder sin ORM

---

### ADR-003: PostgreSQL como Base de Datos

**Status:** Accepted
**Fecha:** 2024-03-18

**Context:**
Se requiere una base de datos relacional robusta con soporte para transacciones ACID, joins complejos, y buenas características JSON.

**Decision:**
Seleccionar PostgreSQL como sistema de base de datos.

**Consecuencias:**

**Positivas:**
- Soporte completo ACID
- Excelente performance en joins
- Soporte nativo JSON
- Extensiones丰富的 (PostGIS, pg_trgm, etc.)
- Open source y estable
- Gran comunidad

**Negativas:**
- Requiere más recursos que SQLite
- Setup más complejo para desarrollo local
- Escalado vertical vs horizontal

**Alternativas Consideradas:**
- MySQL: Popular pero menos features avanzadas
- MongoDB: No relacional, no adecuado para este caso de uso
- SQLite: Para desarrollo, no para producción

---

### ADR-004: JWT para Autenticación

**Status:** Accepted
**Fecha:** 2024-03-18

**Context:**
Se requiere un sistema de autenticación stateless que funcione con APIs REST y soporte tokens de acceso y refresh.

**Decision:**
Implementar autenticación usando JWT (JSON Web Tokens).

**Consecuencias:**

**Positivas:**
- Stateless, ideal para APIs
- Compatible con REST
- Soporte estándar en frameworks
- Puede incluir claims personalizados
- Compatible con OAuth2/OpenID Connect

**Negativas:**
- No revocable sin implementación extra
- Tamaño del token
- Vulnerable si no se maneja correctamente el secret

**Alternativas Consideradas:**
- Session-based cookies: Stateful, no ideal para API
- API Keys: Simple pero sin contexto de usuario
- OAuth2 providers: Para autenticación social, no base

---

### ADR-005: Redis para Cache

**Status:** Accepted
**Fecha:** 2024-03-18

**Context:**
Se requiere un sistema de cache para mejorar performance en endpoints con alta latencia o cálculos pesados.

**Decision:**
Implementar cache usando Redis.

**Consecuencias:**

**Positivas:**
- Performance significativamente mejorado
- Soporte para TTL (time-to-live)
- Public/subscribe pattern para invalidación
- Persistencia opcional
- Scalable horizontalmente

**Negativas:**
- Infraestructura adicional
- Complejidad de cache invalidation
- Costo adicional en producción

**Alternativas Consideradas:**
- In-memory cache: Simple pero no compartido entre instancias
- Memcached: Similar a Redis pero sin persistencia
- CDN cache: Para contenido estático, no APIs

---

### ADR-006: Swagger/OpenAPI para Documentación

**Status:** Accepted
**Fecha:** 2024-03-18

**Context:**
Se requiere documentación interactiva de la API que sea fácil de mantener y consumir por desarrolladores externos.

**Decision:**
Implementar documentación usando Swagger/OpenAPI con @nestjs/swagger.

**Consecuencias:**

**Positivas:**
- Documentación generada automáticamente desde código
- Swagger UI interactiva
- Compatible con clientes API generadores
- Type safety en documentación
- Soporta múltiples formatos (JSON, YAML)

**Negativas:**
- Overhead en decoradores
- Documentación limitada a lo que se define
- Puede desincronizarse si no se actualiza

**Alternativas Consideradas:**
- Markdown docs: Simple pero no interactivo
- Postman docs: Excelente pero requiere mantenimiento manual
- Stoplight Studio: GUI para diseño de API

---

### ADR-007: Arquitectura Modular

**Status:** Accepted
**Fecha:** 2024-03-18

**Context:**
Se requiere una estructura del proyecto que permita escalabilidad, mantenibilidad, y trabajo en paralelo por múltiples desarrolladores.

**Decision:**
Implementar arquitectura modular con cada dominio en su propio módulo NestJS.

**Consecuencias:**

**Positivas:**
- Separación clara de responsabilidades
- Permite trabajo en paralelo
- Fácil testing de módulos individuales
- Reutilizable como librerías
- Lazy loading de módulos

**Negativas:**
- Boilerplate inicial
- Setup de comunicación entre módulos
- Gestión de dependencias entre módulos

**Alternativas Consideradas:**
- Monolito tradicional: Más simple pero menos escalable
- Microservicios: Complejo para MVP
- Modular monolith con DDD: Similar pero más estructura

---

### ADR-008: Validación con class-validator

**Status:** Accepted
**Fecha:** 2024-03-18

**Context:**
Se requiere validación robusta de inputs en todos los endpoints con mensajes de error claros y localizables.

**Decision:**
Implementar validación usando class-validator con DTOs decorados.

**Consecuencias:**

**Positivas:**
- Declarativo y type-safe
- Decoradores estándar
- Compatibilidad con Swagger
- Mensajes de error personalizables
- Validación anidada con ValidateNested

**Negativas:**
- Boilerplate en DTOs
- Overhead en runtime
- Requiere transformación de payloads

**Alternativas Consideradas:**
- Joi: Runtime validation, type-unsafe
- Zod: Similar pero más moderno
- Custom validation: Control total pero más trabajo

---

### ADR-009: Estrategia de Testing: Unit + Integration + E2E

**Status:** Accepted
**Fecha:** 2024-03-18

**Context:**
Se requiere una estrategia de testing que asegure calidad con un balance entre velocidad y cobertura.

**Decision:**
Implementar tres tipos de tests: Unit (Jest), Integration (Jest + Prisma), y E2E (Supertest).

**Consecuencias:**

**Positivas:**
- Coverage completo del código
- Tests rápidos (unit) vs completos (E2E)
- Bugs detectados temprano
- Confianza en deployments

**Negativas:**
- Tiempo de desarrollo adicional
- Mantenimiento de tests
- Setup más complejo

**Alternativas Consideradas:**
- Solo unit tests: Rápido pero coverage incompleto
- Solo E2E tests: Completo pero lento
- Tests manuales: No automatizado

---

### ADR-010: Docker para Desarrollo y Producción

**Status:** Accepted
**Fecha:** 2024-03-18

**Context:**
Se requiere consistencia entre ambientes de desarrollo y producción, y facilitar onboarding de nuevos desarrolladores.

**Decision:**
Usar Docker y Docker Compose para contenerizar la aplicación.

**Consecuencias:**

**Positivas:**
- Consistencia de ambientes
- Facilita onboarding
- Aislamiento de dependencias
- Fácil deployment
- Escalabilidad

**Negativas:**
- Curva de aprendizaje
- Overhead inicial
- Requiere recursos del sistema

**Alternativas Consideradas:**
- Desarrollo nativo: Simple pero inconsistente
- Vagrant: Similar pero más pesado
- Kubernetes: Para producción, excesivo para dev

---

## Decisiones Pendientes

Las siguientes decisiones arquitectónicas aún necesitan ser tomadas:

- [ ] Proveedor de hosting (Railway, AWS, Vercel, etc.)
- [ ] Estrategia de rate limiting
- [ ] Sistema de logging centralizado (Sentry, LogRocket, etc.)
- [ ] Estrategia de backup y disaster recovery
- [ ] Sistema de colas para tareas asíncronas
- [ ] Integración de pagos (Stripe, PayPal, etc.)
- [ ] Sistema de notificaciones (email, SMS, push)
- [ ] Estrategia de internacionalización (i18n)
- [ ] Implementación de WebSockets (si aplica)
- [ ] CDN para assets estáticos