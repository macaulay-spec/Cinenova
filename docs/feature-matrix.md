# CineNova Feature Matrix

| Feature | Guest | Free | Standard | Premium | Admin | Flag | Fallback |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Browse catalogue | Yes | Yes | Yes | Yes | Yes | `catalogue.public` | Cached/editorial rails |
| Search | Yes | Yes | Yes | Yes | Yes | `search.basic` | Suggestions/no-results state |
| Title detail | Yes | Yes | Yes | Yes | Yes | `title.detail` | Safe unavailable copy |
| Playback | No | Limited rights | Standard rights | Premium rights | Test only | `playback.sessions` | Rights-denied problem response |
| Offline download | No | Rights only | Rights only | Rights only | No | `downloads.authorized` | Unavailable state |
| My List | No | Yes | Yes | Yes | No | `library.watchlist` | Prompt sign-in or empty state |
| Profiles/PIN | No | Basic | Yes | Yes | No | `profiles.parental` | Default adult demo profile |
| Billing | Plans only | Upgrade | Manage | Manage | Support view | `billing.provider` | Mock/no-op provider |
| Admin catalogue | No | No | No | No | Yes | `admin.catalogue` | RBAC denied |
| Rights editor | No | No | No | No | RIGHTS_MANAGER+ | `admin.rights` | RBAC denied |
| GZMovie adapter | No | No | No | No | Health only | `provider.gzmovie` | Disabled by default |

No feature flag may be the only enforcement layer for legal rights, security, or authorization.
