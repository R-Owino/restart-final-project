import boto3
import json

dynamodb = boto3.resource('dynamodb', region_name='us-west-2')
dynamodbTableName = 'my_friends'
myFriendsTable = dynamodb.Table(dynamodbTableName)
s3 = boto3.client('s3')
bucketName = 'visitorsphotobucket'
rekognition = boto3.client('rekognition', region_name='us-west-2')

def lambda_handler(event, context):
    """ Main function """
    print("Received event: ", event)
    # get request parameters from frontend
    objectKey = event['queryStringParameters']['objectKey']
    image_binary = s3.get_object(Bucket=bucketName, Key=objectKey)['Body'].read()
    response = rekognition.search_faces_by_image(
        CollectionId='my_friends',
        Image={'Bytes': image_binary}
    )

    # look for a match
    for match in response['FaceMatches']:
        print (match['Face']['FaceId'],match['Face']['Confidence'])
        
    face = dynamodb.get_item(
        TableName=myFriendsTable,  
        Key={'rekognitionId': match['Face']['FaceId']}
        )
    
    if 'Item' in face:
        print('Person found: ', face['Item'])
        return buildResponse(200, {
            'Message': 'Person found',
            'firstName': face['Item']['first_name'],
            'lastName': face['Item']['last_name']
        })
    else:
        print('no match found in person lookup')
        return buildResponse(404, {
            'Message': 'Person not found'
        })

def buildResponse(statusCode, body=None):
    """ Helper function to build API Gateway response """
    response = {
        'statusCode': statusCode,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        }
    }
    if body is not None:
        response['body'] = json.dumps(body)
    return response
