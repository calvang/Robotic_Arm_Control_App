from waitress import serve
import app_engine

serve(app_engine.app, host="0.0.0.0", port=8080)