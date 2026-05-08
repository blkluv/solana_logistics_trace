pub mod config;
pub mod handlers;

use rocket::{routes, Build, Rocket};

/// Rocket instance with routes only (no DB / Solana). Used by tests and `main`.
pub fn build_rocket() -> Rocket<Build> {
    rocket::build().mount("/", routes![handlers::health::health])
}
