use logistics_trace_backend::{build_rocket, config::AppConfig};

#[rocket::main]
async fn main() -> Result<(), rocket::Error> {
    dotenvy::dotenv().ok();
    let cfg = AppConfig::from_env();
    let figment = rocket::Config::figment().merge(("port", cfg.backend_port));

    build_rocket().configure(figment).launch().await?;
    Ok(())
}
