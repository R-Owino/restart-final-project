import boto3

dynamodb = boto3.resource('dynamodb', region_name='us-west-2')
dynamodbTableName = 'my_friends'
myFriendsTable = dynamodb.Table(dynamodbTableName)
s3 = boto3.client('s3')
rekognition = boto3.client('rekognition', region_name='us-west-2')

# ----- Helper Functions ----- 
def lambda_handler(event, context):
    """ Main function """
    print("Received event: ", event)
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']

    try:
        response = friendImage(bucket, key)
        print(response)
        if response['ResponseMetadata']['HTTPStatusCode'] == 200:
            faceId = response['FaceRecords'][0]['Face']['FaceId']
            name = key.split('.')[0].split('_')
            firstName = name[0]
            lastName = name[1]
            register_friend(firstName, lastName, faceId)
        return response
    except Exception as e:
        print(e)
        print(f'Error processing object {key} from bucket {bucket}.')
        raise e
    
def friendImage(bucket, key):
    """ gets the image from s3 buccket """
    response = rekognition.index_faces(
        Image={
            'S3Object': {
                'Bucket': bucket,
                'Name': key
            }
        },
        CollectionId='my_friends'
    )
    return response

def register_friend(firstName, lastName, faceId):
    """ registers the friend in dynamodb """
    myFriendsTable.put_item(
        Item={
            'first_name': firstName,
            'last_name': lastName,
            'rekognitionId': faceId
        }
    )
