use std::collections::HashSet;
use std::str::FromStr;

use rocket_cors::{AllowedHeaders, AllowedOrigins, CorsOptions, Method as CorsMethod};

/// Builds a CORS policy from exact origin strings (`CORS_ALLOWED_ORIGINS`).
pub fn cors_for_origins(origins: &[String]) -> rocket_cors::Cors {
    let refs: Vec<&str> = origins.iter().map(String::as_str).collect();

    let methods: HashSet<CorsMethod> = ["GET", "POST", "PATCH", "OPTIONS"]
        .iter()
        .map(|s| CorsMethod::from_str(s).expect("static method names"))
        .collect();

    CorsOptions::default()
        .allowed_origins(AllowedOrigins::some_exact(&refs))
        .allowed_methods(methods)
        .allowed_headers(AllowedHeaders::some(&["Content-Type", "Accept"]))
        .allow_credentials(false)
        .to_cors()
        .expect("cors builder")
}
