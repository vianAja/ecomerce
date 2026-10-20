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
3. Create the `ecommerce` namespace, then create the
   `ecommerce-runtime-secrets` Kubernetes Secret there before deploying this
   bundle. It must contain these keys:
   - `DB_PASSWORD`: password for the PostgreSQL user.
   - `JWT_SECRET`: a long, random signing key.
   - `REDIS_PASSWORD`: a long, random Redis password.
4. Create an image pull secret named `adinusa-registry` in the `ecommerce`
   namespace using credentials that can pull from `registry.adinusa.id`.
   Do not commit registry or application credentials to Git.

For example, create both secrets in Rancher under **Storage > Secrets** (or use
your organization's external-secrets workflow). The application secret must be
available before Fleet creates the Redis and application pods.

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
