# E-commerce Fleet deployment

This Fleet bundle deploys the e-commerce application, Redis cache, and a single
PostgreSQL instance into the `ecommerce` namespace. The PostgreSQL instance is
included so the registration and login APIs have the database service expected
by `DB_HOST=postgres`.

## Lab storage limitation

This is a disposable training deployment, not a production database design.
The PostgreSQL StatefulSet uses `emptyDir` because this lab cluster currently
has no StorageClass. PostgreSQL data is lost if its Pod is replaced or the
cluster is reset. Do not use this storage configuration for production or for
data that must survive Pod recreation.

## Prerequisites

1. Create a Kubernetes Secret named `ecommerce-runtime-secrets` in namespace
   `ecommerce` before the bundle starts. It must contain:
   - `DB_PASSWORD`: password for the PostgreSQL user.
   - `JWT_SECRET`: a long, random token-signing key.
   - `REDIS_PASSWORD`: a Redis password.
2. Create an image pull Secret named `adinusa-registry` in namespace
   `ecommerce` with credentials allowed to pull
   `registry.adinusa.id/pro-training/node-ecomerce:v1.0`.
3. Do not commit application or registry credentials to Git. The local
   `.env.rancher` is ignored by Git and contains runtime values for the first
   Secret.

The PostgreSQL database uses `DB_NAME` and `DB_USER` from `configmap.yaml`, and
`DB_PASSWORD` from `ecommerce-runtime-secrets`. The initialization SQL from
`src/migrations/init.sql` is copied into `postgres-init-configmap.yaml`; update
both files together when the schema changes. PostgreSQL runs that script when
it initializes a new, empty data directory. The application waits for
PostgreSQL readiness before starting.

## Connect Fleet

Create a GitRepo in Rancher Fleet with:

- **Branch:** `deploy/rancher`
- **Path:** `./deploy/rancher`
- **Target:** the assigned downstream cluster only
- **Target namespace:** leave unset; this bundle uses `defaultNamespace` in
  `fleet.yaml` and does not include a cluster-scoped `Namespace` manifest.

The application is exposed through the `ecommerce` NodePort Service on port
`30080`. Connect to a reachable cluster node using
`http://<node-ip>:30080`; ensure network policy and node firewall rules allow
that TCP port. Redis and PostgreSQL use internal `ClusterIP` Services and are
not exposed outside the cluster.

If a Pod is recreated and reports that `adinusa-registry` cannot be retrieved,
create or correct that image pull Secret in the `ecommerce` namespace, then let
Fleet/Kubernetes retry the Pod. Never place registry credentials in these
manifest files.
