from flask import Flask, make_response, render_template, request
from json import loads
from jsonToExcelConverter import JsonToExcelWriter

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/convertJsonToExcel' , methods=['POST'])
def convertJsonToExcel():

	cacheFileName = 'output/hello.xlsx'

	try:
		dataFromReq = request.get_data("jsonData").decode("utf-8")
		dataFromReq = loads(dataFromReq)
	except Exception as e:
		dataFromReq = None	
		print(e)
		
	json_data = dataFromReq if (not (dataFromReq is None)) else {'a':0 }
 
	JsonToExcelWriter({'jsonData': json_data, 'outputFileName': cacheFileName})

	file_data = None
	with open(cacheFileName, 'rb') as outputFile:
		file_data = outputFile.read()
	
	output = make_response(file_data)
	
	# TODO :: Clean this up with mandatory items	
	output.headers["Content-Disposition"] = f'attachment; filename=report.xlsx'
	output.headers["Content-type"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

	# TODO :: Clean this up with mandatory items
	output.headers.add("Access-Control-Allow-Origin", "*")
	output.headers.add('Access-Control-Allow-Headers', "*")
	output.headers.add('Access-Control-Allow-Methods', "*")

	return output

if __name__ == '__main__':
    app.debug = True
    app.run()