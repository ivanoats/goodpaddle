
deploy:
	scotty  --website --bucket=www.goodpaddle.com --update
	@echo "Done deploying"