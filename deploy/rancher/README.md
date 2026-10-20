# E-commerce Fleet deployment

This Fleet bundle deploys the application image
`registry.adinusa.id/pro-training/node-ecomerce:v1.0` and a single, non-persistent
Redis instance in the `ecommerce` namespace. PostgreSQL is external so its data
and lifecycle can be managed independently.

## Prerequisites

1. Configure a reachable PostgreSQL database named `ecommerce_db` and apply
   `src/migrations/init.sql` once to initialize its schema and sample products.
2. In `deploy/rancher/configmap.yaml`, set `DB_HOST`, `DB_PORT`, `DB_NAME`, and
   `DB_USER` to the PostgreSQL endpoint and database credentials.
3. Fleet targets the `ecommerce` namespace through `fleet.yaml`; do not add a
   namespace manifest to this bundle. Before the application and Redis pods
   start, create a Kubernetes Secret named `ecommerce-runtime-secrets` in the
   `ecommerce` namespace. It must contain these keys:
   - `DB_PASSWORD`: password for the PostgreSQL user.
   - `JWT_SECRET`: a long, random signing key.
   - `REDIS_PASSWORD`: a long, random Redis password.
4. Create an image pull secret named `adinusa-registry` in the `ecommerce`
   namespace using credentials that can pull from `registry.adinusa.id`.
   Do not commit registry or application credentials to Git.

The repository's `.env.sample` documents the expected environment variable
names. A local `.env.rancher` file is provided for the three Secret values and
is excluded from Git. Its `JWT_SECRET` is generated; replace `DB_PASSWORD` if it
does not match the password of the PostgreSQL user configured in
`configmap.yaml`. The Redis password is `admin123` as requested.

From the `ecomerce` repository root, create or update the runtime Secret with:

```powershell
kubectl -n ecommerce create secret generic ecommerce-runtime-secrets `
  --from-env-file=.env.rancher `
  --dry-run=client -o yaml | kubectl apply -f -
```

Create the `adinusa-registry` image pull secret separately in the `ecommerce`
namespace, using registry credentials, or use your organization's
external-secrets workflow. Fleet does not create application or registry
Secrets. If the pods already show `CreateContainerConfigError`, create the
runtime Secret above; Kubernetes will retry starting the pods once it exists.
Do not make the Secret references optional because the application and Redis
require these values.

## Connect Fleet

Create a **GitRepo** resource in Rancher Fleet with:

- **Repository URL**: URL of this e-commerce Git repository.
- **Branch**: `deploy/rancher`
- **Paths**: `./deploy/rancher`

Fleet deploys the bundle to namespace `ecommerce`. The application is exposed as
an internal ClusterIP Service named `ecommerce` on port `80`. Add an Ingress or
Rancher Load Balancer after choosing the hostname and TLS configuration for the
cluster.

Redis is used as a cache and has no persistent storage. The PostgreSQL schema
initialization file is not applied automatically; back up and manage the
external database separately.
