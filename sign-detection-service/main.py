from xml.dom.xmlbuilder import DOMBuilder
from flask import Flask, request, jsonify
from google.cloud import storage
import cv2
import uuid
from torchvision import transforms
from PIL import Image
import onnxruntime as ort
import numpy as np
import os
import json

app = Flask(__name__)


FRAME_FOLDER = "frames"
BUCKET_NAME = os.environ.get("BUCKET_NAME")
os.makedirs(FRAME_FOLDER, exist_ok=True)
storage_client = storage.Client()


classifiers = [
    cv2.CascadeClassifier( os.path.join(os.path.dirname(__file__), 'classifiers' , 'blue-circle-cascade.xml') ),
    cv2.CascadeClassifier( os.path.join(os.path.dirname(__file__), 'classifiers' , 'red-circle-cascade.xml') ),
    cv2.CascadeClassifier( os.path.join(os.path.dirname(__file__), 'classifiers' , 'red-triangle-cascade.xml') ),
    cv2.CascadeClassifier( os.path.join(os.path.dirname(__file__), 'classifiers' , 'slashes-cascade.xml') )
]
TRANSFORM = transforms.Compose([
    transforms.Resize((32,32), interpolation=Image.NEAREST),  # Resize to model input size
    transforms.ToTensor(),  # Convert to Tensor (H, W, C) → (C, H, W)
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])  # Normalize
])

session = ort.InferenceSession(os.path.join(os.path.dirname(__file__), "classifiers" ,"TSR_classification_model.onnx"))
onnx_input_name = session.get_inputs()[0].name

out_dict = {0: 0, 1: 1, 2: 10, 3: 11, 4: 12, 5: 13, 6: 14, 7: 15, 8: 16, 9: 17, 10: 18, 11: 19, 12: 2, 13: 20, 14: 21,
            15: 22, 16: 23, 17: 24, 18: 25, 19: 26, 20: 27, 21: 28, 22: 29, 23: 3, 24: 30, 25: 31, 26: 32, 27: 33,
            28: 34, 29: 35, 30: 36, 31: 37, 32: 38, 33: 39, 34: 4, 35: 40, 36: 41, 37: 42, 38: 42, 39: 5, 40: 6, 41: 7,
            42: 8, 43: 9}
def detect_signs(frame):
    """
    Service method for detecting signs in a frame
    """
    img_gray=cv2.cvtColor(frame,cv2.COLOR_BGR2GRAY)
    result=[]
    for i in range(4):
        rectangles,reject,weights=classifiers[i].detectMultiScale3(img_gray, 1.1,5,outputRejectLevels=True,minSize=(45,45))
        for ind,rect in enumerate(rectangles):
            if abs(weights[ind])<0.9:
                continue
            x,y,w,h=rect
            result.append((x, y, x + h, y + w))

    return result

def classify_signs(frame, rectangles):
    result=[]
    frame_img=Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

    for x,y,x1,y1 in rectangles:
        sign_crop=frame_img.crop((x , (y - 10), x1 , (y1 + 10)))

        sign_crop = TRANSFORM(sign_crop)
        # Add batch dimension (1, C, H, W)
        sign_crop = sign_crop.unsqueeze(0).numpy()

        onnx_output = session.run(None, {onnx_input_name: sign_crop})
        output_array = np.array(onnx_output[0])

        predicted_class = np.argmax(output_array, axis=1)[0]
        predicted = out_dict[predicted_class]
        #special case
        if predicted == 42:
            second_best_class = np.argsort(output_array, axis=1)[0, -2]
            predicted = out_dict[second_best_class]
        result.append({'point':{'x1':int(x),'y1':int(y),'x2':int(x1),'y2':int(y1)},'classId':int(predicted)})

    return result

def get_frame_by_id(frame_id: str):
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(frame_id)
    frame_path = os.path.join(FRAME_FOLDER, frame_id)
    blob.download_to_filename(frame_path)
    if not os.path.exists(frame_path):
        return None
    frame = cv2.imread(frame_path)
    return frame    


@app.route('/detect-signs',methods=['POST'])
def detect():
    """
    Endpoint for handling detection of signs in a frame
    """
    try:
   
        frame_id=request.get_json().get('frame_id')
        if frame_id is None:
            return jsonify({'message':'frame_id is required'}), 400
        frame=get_frame_by_id(frame_id)

        if frame is None:
            return jsonify({'message':f'Frame not found for id:{frame_id}'}), 404
        detections = detect_signs(frame)
        classifications = classify_signs(frame, detections)
        return jsonify({'detections': classifications}), 200
    except Exception as e:
        return jsonify({'message':str(e)}), 500
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
