reddit-comment-collapser.zip: manifest.json LICENSE.txt js/*.js views/*.html css/*.css image/*.png image/colours/*.png
	rm -f $@
	zip -r $@ manifest.json LICENSE.txt js views css image -x "image/screenshot*"
