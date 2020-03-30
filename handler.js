'use strict';

const AWS = require('aws-sdk');
const databaseManager = require('./dbconfig');
const uuidv2 = require('uuid/v2');

var sqs = new AWS.SQS({ region: 'ap-southeast-1' });

const AWS_ACCOUNT = process.env.ACCOUNT_ID;
const QUEUE_URL = `https://sqs.ap-southeast-1.amazonaws.com/${AWS_ACCOUNT}/MyQueue`; //this is the URL where we will send the messages

//function1
module.exports.api1 = (event, context, callback) => {
	const params = {
		MessageBody: 'Hola',
		QueueUrl: QUEUE_URL
	};
  
  //send the message
	sqs.sendMessage(params, function(err, data) {
		if (err) {
			console.log('error:', 'Fail Send Message' + err);

			const response = {
				statusCode: 500,
				body: JSON.stringify({
					message: 'ERROR'
				})
			};

			callback(null, response);
		} else {
			console.log('data:', data.MessageId);

			const response = {
				statusCode: 200,
				body: JSON.stringify({
					message: data.MessageId
				})
			};

			callback(null, response);
		}
	});
};

//funtion2
module.exports.api2 = (event, context, callback) => {
	console.log('it was called');

	console.log(event);

	context.done(null, '');
}

exports.Myapi = async (event) => {
	console.log(event);

	switch (event.httpMethod) {
		case 'DELETE':
			return deleteItem(event);
		case 'GET':
			return getItem(event);
		case 'POST':
			return saveItem(event);
		case 'PUT':
			return updateItem(event);
		default:
			return sendResponse(404, `Unsupported method "${event.httpMethod}"`);
	}
};

function saveItem(event) {
	const item = JSON.parse(event.body);
	item.itemId = uuidv2();

	return databaseManager.saveItem(item).then(response => {
		console.log(response);
		return sendResponse(200, item.itemId);
	});
}

function getItem(event) {
	const itemId = event.pathParameters.itemId;

	return databaseManager.getItem(itemId).then(response => {
		console.log(response);
		return sendResponse(200, JSON.stringify(response));
	});
}

function deleteItem(event) {
	const itemId = event.pathParameters.itemId;

	return databaseManager.deleteItem(itemId).then(response => {
		return sendResponse(200, 'DELETE ITEM');
	});
}

function updateItem(event) {
	const itemId = event.pathParameters.itemId;

	const body = JSON.parse(event.body);
	const paramName = body.paramName;
	const paramValue = body.paramValue;

	return databaseManager.updateItem(itemId, paramName, paramValue).then(response => {
		console.log(response);
		return sendResponse(200, JSON.stringify(response));
	});
}

function sendResponse(statusCode, message) {
	const response = {
		statusCode: statusCode,
		body: JSON.stringify(message)
	};
	return response
}