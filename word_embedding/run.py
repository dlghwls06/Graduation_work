import uvicorn

uvicorn.run("app:app", host="0.0.0.0", port=5050, reload=False)
