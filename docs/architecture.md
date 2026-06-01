# Competitive Programming Analytics & Recommendation Platform Architecture

## Product Scope

The platform is an intelligent competitive programming coach. It ingests user
activity from competitive programming providers, analyzes performance,
identifies weaknesses, predicts future performance, recommends practice, and
generates AI-assisted coaching plans.

Initial provider: Codeforces.

Future providers: LeetCode, AtCoder, CodeChef, CSES, Kattis.

Primary users:

- Competitive programmers who want structured improvement.
- Coaches or groups tracking student progress.
- Future organization accounts for teams, classrooms, or clubs.

## Architectural Principles

- Use a modular monolith first, with explicit domain boundaries and clean
  interfaces so high-load domains can be split into services later.
- Treat external platforms as providers behind adapters; never leak provider
  payloads into core analytics or recommendation logic.
- Keep raw ingested data, normalized domain data, feature data, model outputs,
  and generated coaching artifacts separate.
- Make every async workflow observable, idempotent, retryable, and auditable.
- Version analytics definitions, feature sets, recommendations, models, and
  generated plans.
- Keep the API stable and versioned from the start.

## Repository Structure

```text
cp-recommendation-platform/
  backend/
    app/
      main.py
      api/
        deps.py
        router.py
        v1/
          auth.py
          users.py
          providers.py
          codeforces.py
          analytics.py
          recommendations.py
          roadmaps.py
          coaching.py
          jobs.py
      core/
        config.py
        logging.py
        security.py
        pagination.py
        errors.py
      db/
        base.py
        session.py
        migrations/
      domains/
        identity/
          models.py
          schemas.py
          repository.py
          service.py
        providers/
          models.py
          schemas.py
          contracts.py
          service.py
        codeforces/
          client.py
          mapper.py
          ingestion.py
          schemas.py
        contests/
          models.py
          repository.py
          service.py
        problems/
          models.py
          repository.py
          service.py
        submissions/
          models.py
          repository.py
          service.py
        analytics/
          models.py
          calculators/
          repository.py
          service.py
        recommendations/
          models.py
          rankers/
          service.py
        roadmaps/
          models.py
          service.py
        coaching/
          prompts/
          schemas.py
          service.py
      workers/
        celery_app.py
        schedules.py
        tasks/
          sync_codeforces.py
          compute_analytics.py
          generate_recommendations.py
          train_models.py
      observability/
        metrics.py
        tracing.py
        health.py
      tests/
        unit/
        integration/
        contract/
    pyproject.toml
    alembic.ini
    Dockerfile

  frontend/
    app/
      (auth)/
      dashboard/
      analytics/
      recommendations/
      roadmap/
      coaching/
    components/
      charts/
      layout/
      ui/
    features/
      auth/
      analytics/
      recommendations/
      roadmaps/
    lib/
      api.ts
      auth.ts
      query-client.ts
    types/
    tests/
    package.json
    Dockerfile

  ml/
    pipelines/
      feature_engineering/
      training/
      evaluation/
      inference/
    features/
      user_features.py
      problem_features.py
      interaction_features.py
    models/
      success_prediction/
      rating_growth/
      recommender/
    notebooks/
      exploration/
    tests/
    pyproject.toml

  data/
    contracts/
      codeforces/
      analytics/
      features/
    seeds/

  infra/
    docker/
      backend.Dockerfile
      frontend.Dockerfile
      worker.Dockerfile
    compose/
      docker-compose.yml
      docker-compose.override.yml
    k8s/
      base/
      overlays/
        dev/
        prod/
    terraform/
      aws/
        networking/
        rds/
        elasticache/
        ecs-or-eks/
        observability/

  docs/
    architecture.md
    api.md
    data-model.md
    ml-system.md
    operations.md

  scripts/
    dev/
    ci/
    data/

  .github/
    workflows/
      backend-ci.yml
      frontend-ci.yml
      ml-ci.yml
```

## Service Architecture

### Backend Runtime

The backend starts as a modular monolith:

- FastAPI handles HTTP APIs.
- SQLAlchemy owns transactional persistence.
- PostgreSQL is the source of truth.
- Redis supports caching, rate limiting, Celery broker/result backend, and
  short-lived locks.
- Celery executes ingestion, analytics, recommendation, and ML orchestration
  jobs.
- MLflow tracks experiments, model artifacts, metrics, and model versions.

The modular monolith should expose domain services internally instead of sharing
model objects freely across modules. Each domain owns:

- SQLAlchemy models.
- Pydantic request/response schemas.
- Repository methods.
- Domain service methods.
- Domain-specific errors.

### Domains

Identity:

- Local user accounts.
- Password authentication.
- JWT access and refresh token lifecycle.
- Future OAuth identities.

Provider Accounts:

- Links a platform handle to an internal user.
- Stores provider type, verification state, and sync status.
- Defines provider-neutral contracts.

Codeforces Integration:

- Codeforces API client with rate limiting, retries, and circuit breaker.
- Raw payload persistence for audit and replay.
- Mapping layer from Codeforces payloads to normalized tables.
- Incremental sync using last seen submission ID, contest ID, and rating update.

Contest Domain:

- Contest metadata.
- User participation.
- Rating changes.
- Rank, percentile, performance rating approximations.

Problem Domain:

- Problem identity across providers.
- Tags, difficulty, source contest, and metadata.
- Problem normalization for recommendation and analytics.

Submission Domain:

- Submission history.
- Verdicts, languages, timestamps, problem links.
- Derived solve events and attempt counts.

Analytics Domain:

- Rating trends.
- Tag-wise metrics.
- Difficulty metrics.
- Consistency and participation metrics.
- Weakness detection.
- Improvement tracking.

Recommendation Domain:

- Candidate generation.
- Filtering.
- Ranking.
- Explanation generation.
- Feedback loop from acceptance, skip, bookmark, and solved events.

Roadmap Domain:

- Goal-oriented learning paths.
- Weekly and monthly study plans.
- Topic sequencing.
- Progress tracking.

Coaching Domain:

- AI-generated explanations and plans.
- Prompt templates versioned by use case.
- Guardrails against unsupported claims.
- Cached generated advice with provenance from analytics snapshots.

## Data Flow

```text
Codeforces API
  -> provider client
  -> raw provider snapshots
  -> normalized contests/problems/submissions/rating changes
  -> analytics calculators
  -> feature pipeline
  -> recommendation and prediction models
  -> recommendation records and coaching context
  -> API responses and frontend visualizations
```

Scheduled workflows:

- Frequent lightweight sync: recent submissions and rating changes.
- Daily profile refresh: user profile, current rating, max rating, rank.
- Daily analytics recomputation for active users.
- Daily recommendation refresh for active users.
- Weekly roadmap and coaching summary generation.
- Periodic feature backfill and model retraining.

All scheduled jobs should be idempotent and keyed by user, provider, and sync
window.

## Database Schema

PostgreSQL should use UUID primary keys for internal entities and provider
natural keys for deduplication. Timestamps use `timestamptz`.

### Identity And Auth

```sql
users (
  id uuid primary key,
  email citext unique not null,
  username text unique not null,
  password_hash text not null,
  display_name text,
  role text not null default 'user',
  status text not null default 'active',
  created_at timestamptz not null,
  updated_at timestamptz not null
);

auth_refresh_tokens (
  id uuid primary key,
  user_id uuid not null references users(id),
  token_hash text not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null
);

oauth_identities (
  id uuid primary key,
  user_id uuid not null references users(id),
  provider text not null,
  provider_subject text not null,
  email citext,
  created_at timestamptz not null,
  unique (provider, provider_subject)
);
```

### Provider Accounts

```sql
provider_accounts (
  id uuid primary key,
  user_id uuid not null references users(id),
  provider text not null,
  handle text not null,
  normalized_handle text not null,
  verification_status text not null default 'unverified',
  last_sync_at timestamptz,
  sync_cursor jsonb not null default '{}',
  created_at timestamptz not null,
  updated_at timestamptz not null,
  unique (provider, normalized_handle),
  unique (user_id, provider)
);

provider_raw_events (
  id uuid primary key,
  provider_account_id uuid not null references provider_accounts(id),
  provider text not null,
  resource_type text not null,
  resource_id text,
  payload jsonb not null,
  payload_hash text not null,
  fetched_at timestamptz not null,
  unique (provider, resource_type, resource_id, payload_hash)
);
```

### Codeforces Profile And Contest Data

```sql
user_profiles (
  id uuid primary key,
  provider_account_id uuid not null references provider_accounts(id),
  provider text not null,
  handle text not null,
  display_name text,
  current_rating int,
  max_rating int,
  rank text,
  max_rank text,
  contribution int,
  friend_of_count int,
  avatar_url text,
  profile_url text,
  last_seen_online_at timestamptz,
  snapshot_at timestamptz not null,
  unique (provider_account_id, snapshot_at)
);

contests (
  id uuid primary key,
  provider text not null,
  provider_contest_id text not null,
  name text not null,
  contest_type text,
  phase text,
  starts_at timestamptz,
  duration_seconds int,
  created_at timestamptz not null,
  unique (provider, provider_contest_id)
);

contest_participations (
  id uuid primary key,
  provider_account_id uuid not null references provider_accounts(id),
  contest_id uuid not null references contests(id),
  rank int,
  old_rating int,
  new_rating int,
  rating_delta int,
  performance_rating int,
  solved_count int,
  penalty int,
  participated_at timestamptz,
  created_at timestamptz not null,
  unique (provider_account_id, contest_id)
);
```

### Problems, Tags, And Submissions

```sql
problems (
  id uuid primary key,
  provider text not null,
  provider_problem_key text not null,
  contest_id uuid references contests(id),
  index text,
  name text not null,
  problem_type text,
  rating int,
  points numeric,
  url text,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  unique (provider, provider_problem_key)
);

problem_tags (
  problem_id uuid not null references problems(id),
  tag text not null,
  primary key (problem_id, tag)
);

submissions (
  id uuid primary key,
  provider_account_id uuid not null references provider_accounts(id),
  provider text not null,
  provider_submission_id text not null,
  problem_id uuid references problems(id),
  submitted_at timestamptz not null,
  programming_language text,
  verdict text,
  passed_tests int,
  time_ms int,
  memory_bytes bigint,
  creation_source text not null default 'provider_sync',
  raw_event_id uuid references provider_raw_events(id),
  created_at timestamptz not null,
  unique (provider, provider_submission_id)
);

user_problem_attempts (
  id uuid primary key,
  provider_account_id uuid not null references provider_accounts(id),
  problem_id uuid not null references problems(id),
  first_attempt_at timestamptz,
  first_accepted_at timestamptz,
  last_submission_at timestamptz,
  attempt_count int not null default 0,
  accepted_count int not null default 0,
  wrong_answer_count int not null default 0,
  tle_count int not null default 0,
  mle_count int not null default 0,
  compilation_error_count int not null default 0,
  solved boolean not null default false,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  unique (provider_account_id, problem_id)
);
```

### Analytics

```sql
analytics_snapshots (
  id uuid primary key,
  provider_account_id uuid not null references provider_accounts(id),
  snapshot_type text not null,
  period_start timestamptz,
  period_end timestamptz,
  version text not null,
  metrics jsonb not null,
  created_at timestamptz not null
);

tag_performance_metrics (
  id uuid primary key,
  provider_account_id uuid not null references provider_accounts(id),
  tag text not null,
  period_start timestamptz,
  period_end timestamptz,
  attempted_count int not null,
  solved_count int not null,
  acceptance_rate numeric not null,
  avg_problem_rating numeric,
  median_attempts numeric,
  weakness_score numeric not null,
  confidence numeric not null,
  version text not null,
  computed_at timestamptz not null
);

difficulty_performance_metrics (
  id uuid primary key,
  provider_account_id uuid not null references provider_accounts(id),
  rating_bucket int not null,
  attempted_count int not null,
  solved_count int not null,
  acceptance_rate numeric not null,
  avg_attempts numeric,
  version text not null,
  computed_at timestamptz not null
);

weaknesses (
  id uuid primary key,
  provider_account_id uuid not null references provider_accounts(id),
  weakness_type text not null,
  label text not null,
  severity numeric not null,
  evidence jsonb not null,
  status text not null default 'active',
  detected_at timestamptz not null,
  resolved_at timestamptz
);
```

### Recommendations And Roadmaps

```sql
recommendation_batches (
  id uuid primary key,
  provider_account_id uuid not null references provider_accounts(id),
  strategy text not null,
  model_version text,
  context_snapshot_id uuid references analytics_snapshots(id),
  generated_at timestamptz not null,
  expires_at timestamptz,
  metadata jsonb not null default '{}'
);

problem_recommendations (
  id uuid primary key,
  batch_id uuid not null references recommendation_batches(id),
  problem_id uuid not null references problems(id),
  rank int not null,
  score numeric not null,
  reason_codes text[] not null,
  explanation text,
  target_tags text[] not null default '{}',
  target_rating int,
  status text not null default 'active',
  created_at timestamptz not null,
  unique (batch_id, problem_id)
);

recommendation_feedback (
  id uuid primary key,
  recommendation_id uuid not null references problem_recommendations(id),
  provider_account_id uuid not null references provider_accounts(id),
  action text not null,
  feedback_at timestamptz not null,
  metadata jsonb not null default '{}'
);

roadmaps (
  id uuid primary key,
  provider_account_id uuid not null references provider_accounts(id),
  goal text not null,
  horizon_days int not null,
  version text not null,
  status text not null default 'active',
  generated_at timestamptz not null
);

roadmap_items (
  id uuid primary key,
  roadmap_id uuid not null references roadmaps(id),
  sequence int not null,
  item_type text not null,
  title text not null,
  description text,
  target_tags text[] not null default '{}',
  target_rating_min int,
  target_rating_max int,
  due_at timestamptz,
  status text not null default 'pending'
);
```

### ML And Feature Store

```sql
feature_sets (
  id uuid primary key,
  name text not null,
  version text not null,
  entity_type text not null,
  schema jsonb not null,
  created_at timestamptz not null,
  unique (name, version)
);

feature_values (
  id uuid primary key,
  feature_set_id uuid not null references feature_sets(id),
  entity_id uuid not null,
  event_time timestamptz not null,
  features jsonb not null,
  created_at timestamptz not null,
  unique (feature_set_id, entity_id, event_time)
);

model_predictions (
  id uuid primary key,
  provider_account_id uuid references provider_accounts(id),
  problem_id uuid references problems(id),
  model_name text not null,
  model_version text not null,
  prediction_type text not null,
  score numeric not null,
  features_ref jsonb,
  predicted_at timestamptz not null
);
```

### Jobs And Operations

```sql
sync_jobs (
  id uuid primary key,
  provider_account_id uuid references provider_accounts(id),
  job_type text not null,
  status text not null,
  cursor_before jsonb,
  cursor_after jsonb,
  error_code text,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null
);

audit_log (
  id uuid primary key,
  actor_user_id uuid references users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null
);
```

### Required Indexes

- `provider_accounts(user_id, provider)`
- `provider_accounts(provider, normalized_handle)`
- `submissions(provider_account_id, submitted_at desc)`
- `submissions(problem_id, verdict)`
- `user_problem_attempts(provider_account_id, solved, last_submission_at desc)`
- `contests(provider, starts_at desc)`
- `contest_participations(provider_account_id, participated_at desc)`
- `problem_tags(tag)`
- `problems(provider, rating)`
- `analytics_snapshots(provider_account_id, snapshot_type, created_at desc)`
- `tag_performance_metrics(provider_account_id, weakness_score desc)`
- `problem_recommendations(batch_id, rank)`
- `feature_values(feature_set_id, entity_id, event_time desc)`
- `sync_jobs(provider_account_id, job_type, created_at desc)`

For high-volume installations, partition `submissions`, `provider_raw_events`,
`feature_values`, and `model_predictions` by month.

## API Design

All APIs are versioned under `/api/v1`. Responses should use consistent error
envelopes, pagination metadata, and request IDs.

### Auth

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
```

### User And Provider Accounts

```text
GET    /api/v1/users/me
PATCH  /api/v1/users/me

GET    /api/v1/providers/accounts
POST   /api/v1/providers/accounts
GET    /api/v1/providers/accounts/{account_id}
DELETE /api/v1/providers/accounts/{account_id}
POST   /api/v1/providers/accounts/{account_id}/verify
POST   /api/v1/providers/accounts/{account_id}/sync
GET    /api/v1/providers/accounts/{account_id}/sync-jobs
```

### Codeforces

```text
GET    /api/v1/codeforces/handles/{handle}/profile
POST   /api/v1/codeforces/import
POST   /api/v1/codeforces/sync
GET    /api/v1/codeforces/accounts/{account_id}/submissions
GET    /api/v1/codeforces/accounts/{account_id}/rating-changes
GET    /api/v1/codeforces/accounts/{account_id}/contests
```

### Analytics

```text
GET    /api/v1/analytics/summary
GET    /api/v1/analytics/rating-trend
GET    /api/v1/analytics/tags
GET    /api/v1/analytics/difficulty
GET    /api/v1/analytics/contests
GET    /api/v1/analytics/consistency
GET    /api/v1/analytics/topic-coverage
GET    /api/v1/analytics/weaknesses
POST   /api/v1/analytics/recompute
```

Query filters:

- `provider_account_id`
- `period=30d|90d|180d|365d|all`
- `provider=codeforces`
- `version`

### Recommendations

```text
GET    /api/v1/recommendations/problems
POST   /api/v1/recommendations/problems/generate
POST   /api/v1/recommendations/{recommendation_id}/feedback

GET    /api/v1/recommendations/topics
GET    /api/v1/recommendations/contests
```

Problem recommendation filters:

- `target=weakness|rating_growth|contest_prep|coverage`
- `difficulty_min`
- `difficulty_max`
- `tags`
- `exclude_solved=true`
- `limit`

### Roadmaps

```text
GET    /api/v1/roadmaps
POST   /api/v1/roadmaps
GET    /api/v1/roadmaps/{roadmap_id}
PATCH  /api/v1/roadmaps/{roadmap_id}
POST   /api/v1/roadmaps/{roadmap_id}/items/{item_id}/complete
```

### AI Coaching

```text
POST   /api/v1/coaching/weakness-explanation
POST   /api/v1/coaching/weekly-plan
POST   /api/v1/coaching/monthly-plan
POST   /api/v1/coaching/contest-strategy
GET    /api/v1/coaching/history
```

AI coaching endpoints should persist:

- Prompt template version.
- Input analytics snapshot IDs.
- Model/provider used.
- Output.
- Safety status.

### Jobs And Admin

```text
GET    /api/v1/jobs/{job_id}
GET    /api/v1/jobs
POST   /api/v1/admin/jobs/retry
GET    /api/v1/admin/health
GET    /api/v1/admin/metrics
```

## Analytics Design

### Rating Trend Analysis

Outputs:

- Current rating.
- Max rating.
- Rating delta over selectable periods.
- Rolling average rating change.
- Volatility.
- Plateau detection.
- Contest frequency correlation.

Core features:

- `rating_slope_30d`
- `rating_slope_90d`
- `rating_volatility_180d`
- `positive_delta_ratio`
- `contest_gap_mean_days`
- `contest_gap_std_days`

### Tag-Wise Performance

Metrics per tag:

- Attempted problems.
- Solved problems.
- Acceptance rate.
- Average attempts before AC.
- Average solved difficulty.
- Recent trend.
- Confidence score based on sample size.
- Weakness score.

Weakness score should combine:

- Low acceptance rate.
- High attempt count.
- Underperformance versus user rating.
- Recent failures.
- Sufficient evidence threshold.

### Difficulty-Wise Performance

Difficulty buckets:

- Below current rating by 400+.
- Below current rating by 200-399.
- Near current rating.
- Above current rating by 100-299.
- Stretch zone above rating by 300-500.
- Out-of-range exploratory.

Recommendation target should usually sit in the stretch zone, not random very
hard problems.

### Consistency Metrics

- Active days per week.
- Solves per active day.
- Longest streak.
- Current streak.
- Weekly solve variance.
- Contest participation cadence.
- Practice-to-contest ratio.

### Topic Coverage

- Coverage by Codeforces tags.
- Coverage by canonical internal topic taxonomy.
- Depth score per topic.
- Breadth score across topics.
- Missing prerequisites for target topics.

Use an internal topic taxonomy so future providers can map their tags into
stable concepts.

## Recommendation Architecture

### Recommendation Pipeline

```text
Candidate generation
  -> eligibility filters
  -> feature enrichment
  -> ranking
  -> diversification
  -> explanation
  -> persistence
  -> feedback collection
```

Candidate generators:

- Weakness-focused problems.
- Rating growth stretch problems.
- Topic coverage problems.
- Similar users solved next.
- Contest preparation sets.
- Roadmap-aligned candidates.

Filters:

- Exclude solved problems.
- Exclude very low quality or unavailable problems.
- Exclude problems far outside difficulty bounds unless explicitly requested.
- Avoid over-recommending the same tag.
- Respect user preferences and hidden problems.

Rankers:

- Baseline heuristic ranker for MVP.
- Learning-to-rank model once enough feedback exists.
- Collaborative filtering for user-problem interactions.
- Neural recommender later.

Diversification:

- Mix weak topics, maintenance topics, and stretch topics.
- Limit same contest clustering.
- Limit repeated tags.
- Include occasional review problems below current level for speed and
  confidence.

Explanation examples:

- "Targets dynamic programming, where recent acceptance rate is 34%."
- "Difficulty is near your current stretch zone."
- "Similar users solved this before their next rating increase."

## ML Architecture

### ML Components

Feature Engineering:

- User aggregates over rolling windows.
- Problem metadata features.
- User-problem interaction features.
- Contest behavior features.
- Temporal consistency features.
- Tag and topic embeddings.

Models:

- Success prediction: probability user solves a problem within N attempts or
  days.
- Rating growth prediction: expected rating delta or growth band over 30/90
  days.
- Recommendation ranking: score candidate problems.
- Weakness detection: calibrated severity and confidence.
- User embeddings: learned from solved tags, difficulty trajectory, and contest
  behavior.
- Problem embeddings: learned from tags, rating, co-solve patterns, and contest
  context.

Baseline algorithms:

- Logistic regression for solve success baseline.
- LightGBM/XGBoost for tabular success and growth prediction.
- Matrix factorization for collaborative filtering.
- Two-tower neural retrieval model later.
- Sequence-aware models later for learning trajectory.

### Feature Store

Start with a PostgreSQL-backed feature store:

- `feature_sets` defines versioned schemas.
- `feature_values` stores point-in-time feature rows.
- Offline training reads feature snapshots by event time.
- Online inference reads latest feature rows and cached aggregates.

Upgrade path:

- Feast or custom Redis/Postgres online store if latency and reuse demand it.
- S3/Parquet lake for large historical training data.

### Experiment Tracking

MLflow tracks:

- Dataset version.
- Feature set version.
- Training code version.
- Model parameters.
- Metrics.
- Artifacts.
- Model signature.
- Evaluation slices.

Required evaluation slices:

- Rating bands.
- Active versus inactive users.
- New versus experienced users.
- Tag groups.
- Problem difficulty buckets.
- Time-based validation windows.

### Data Validation

Use Pandera, Great Expectations, or Pydantic-based batch checks for:

- Required columns.
- Valid rating ranges.
- No future timestamps.
- Known verdict values.
- Duplicate provider IDs.
- Feature null thresholds.
- Training/serving skew checks.

### Model Serving

Initial serving:

- Batch predictions stored in `model_predictions`.
- Recommendation jobs consume predictions.

Later serving:

- FastAPI inference endpoint for low-latency score requests.
- Separate model service only if deployment or scaling pressure justifies it.

### Model Monitoring

Track:

- Prediction distribution drift.
- Feature distribution drift.
- Recommendation click/accept/solve rate.
- Calibration of success probability.
- Rating growth prediction error.
- Coverage and diversity of recommendations.
- Cold-start quality.

## AI Coaching Layer

AI coaching should not invent performance claims. It should ground every answer
in analytics snapshots, recommendation batches, and roadmap state.

Inputs:

- Current rating and trend.
- Weakness records with evidence.
- Recent submissions.
- Solved topic distribution.
- Upcoming contests if available.
- User goals and available weekly time.

Outputs:

- Weakness explanations.
- Weekly plans.
- Monthly plans.
- Contest preparation strategies.
- Post-contest review summaries.

Guardrails:

- Persist the exact analytics context used.
- Include confidence levels when evidence is thin.
- Prefer concrete problem/topic actions over generic motivation.
- Never expose raw private user data in prompts beyond what is required.
- Version prompt templates.

## Frontend Architecture

Next.js application structure:

- App Router.
- Server components for page shells where useful.
- Client components for charts, filters, and interactions.
- TanStack Query or equivalent for API caching.
- shadcn/ui for primitives.
- Recharts for analytics visuals.
- Zod for client-side schema validation.

Primary views:

- Authentication.
- Provider connection and sync status.
- Dashboard summary.
- Rating trend.
- Topic and tag analytics.
- Difficulty analytics.
- Weakness explorer.
- Problem recommendations.
- Roadmap planner.
- AI coaching workspace.
- Job and sync history.

Dashboard should emphasize coaching actions over vanity metrics:

- What changed?
- What is weak?
- What should the user solve next?
- What is the plan this week?
- Is the user on track?

## Deployment Architecture

### Local Development

Docker Compose services:

- `backend`
- `frontend`
- `worker`
- `beat`
- `postgres`
- `redis`
- `mlflow`
- optional `minio` for artifact storage compatibility

### AWS-Ready Path

Recommended managed services:

- ECS Fargate or EKS for API and workers.
- RDS PostgreSQL.
- ElastiCache Redis.
- S3 for ML artifacts, raw exports, and dataset snapshots.
- CloudWatch logs and metrics.
- Secrets Manager or SSM Parameter Store.
- ALB in front of API and frontend.

### Kubernetes-Ready Path

Kubernetes workloads:

- API deployment.
- Worker deployment.
- Beat deployment.
- Frontend deployment.
- Horizontal pod autoscaling for API and workers.
- CronJobs for scheduled ML/data workflows if replacing Celery beat.
- ConfigMaps and Secrets.
- Network policies.
- Pod disruption budgets.

## Observability

API Monitoring:

- Request count, latency, and error rate.
- Per-route metrics.
- Auth failure rate.
- Provider API error rate.

Job Monitoring:

- Queue depth.
- Job success/failure counts.
- Job duration.
- Retry counts.
- Dead letter tracking.
- Last successful sync per account.

Model Monitoring:

- Batch prediction freshness.
- Feature freshness.
- Drift metrics.
- Recommendation feedback funnel.
- Model performance by slice.

Logging:

- Structured JSON logs.
- Request ID and job ID propagation.
- Provider account ID only where appropriate.
- No secrets or tokens.

## Security

- Hash passwords with Argon2id or bcrypt.
- Short-lived JWT access tokens.
- Rotating refresh tokens stored hashed.
- Role-based authorization hooks.
- Provider handle ownership verification.
- Rate limit auth and provider sync endpoints.
- Store secrets outside the repository.
- Use scoped service credentials in deployment.
- Audit sensitive operations.

## Initial Development Roadmap

### Phase 0: Foundation

- Create repository structure.
- Add Docker Compose for PostgreSQL, Redis, backend, worker, and frontend.
- Configure FastAPI app shell, settings, logging, health checks.
- Configure SQLAlchemy, Alembic, and base migrations.
- Configure CI for linting, type checks, tests, and Docker builds.

### Phase 1: Identity And Codeforces Ingestion

- Implement JWT auth and refresh tokens.
- Implement provider account linking for Codeforces handles.
- Build Codeforces API client with retries, rate limiting, and typed responses.
- Persist raw provider events.
- Normalize profiles, contests, problems, submissions, and rating changes.
- Add Celery sync jobs and sync status APIs.

### Phase 2: Core Analytics

- Build rating trend analytics.
- Build tag-wise and difficulty-wise metrics.
- Build contest participation analytics.
- Build consistency metrics.
- Implement weakness detection v1.
- Expose analytics APIs.
- Build dashboard and analytics frontend views.

### Phase 3: Recommendation MVP

- Implement candidate generation from unsolved Codeforces problems.
- Implement heuristic ranker using weakness score, difficulty fit, and recency.
- Store recommendation batches and feedback.
- Build recommendation UI.
- Add roadmap generation v1 using rule-based sequencing.

### Phase 4: ML Baselines

- Add feature engineering pipelines.
- Add versioned feature sets.
- Train solve success baseline.
- Train rating growth baseline.
- Track experiments with MLflow.
- Add batch prediction jobs.
- Compare heuristic and ML-assisted rankers.

### Phase 5: AI Coaching

- Add prompt templates and coaching service.
- Generate weakness explanations from analytics evidence.
- Generate weekly and monthly plans from roadmap and recommendations.
- Add coaching history and provenance.
- Add safety checks and prompt/output versioning.

### Phase 6: Production Hardening

- Add integration and contract tests for provider ingestion.
- Add provider API backoff and circuit breaker.
- Add data validation checks.
- Add monitoring dashboards and alerts.
- Add backup and restore procedures.
- Add deployment manifests for AWS and Kubernetes.

### Phase 7: Expansion

- Add AtCoder provider adapter.
- Add LeetCode provider adapter if data access constraints are acceptable.
- Add collaborative filtering.
- Add user and problem embeddings.
- Add learning-to-rank recommender.
- Add organization/team accounts.

## Non-Goals For The First Release

- Real-time streaming ingestion.
- Fully separate microservices.
- Neural recommendation serving.
- Multi-tenant enterprise administration.
- Automated OAuth for every provider.
- Full natural language tutoring chat without analytics grounding.

## First Implementation Slice

The first production slice should deliver:

- Register/login.
- Link Codeforces handle.
- Sync profile, rating changes, submissions, contests, and problems.
- Show dashboard analytics.
- Show detected weaknesses.
- Recommend 10-20 problems with clear reasons.
- Generate a simple weekly plan.
- Run everything locally through Docker Compose.

This slice proves the core loop: ingest data, analyze it, recommend action, and
learn from feedback.
