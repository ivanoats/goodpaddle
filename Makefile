
deploy:
	scotty  --website --bucket=www.goodpaddle.com --update
	@echo "Done deploying"

serve:
	live-server --port=8000 . &> /tmp/server.log &
