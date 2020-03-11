# -*- coding: utf-8 -*-
"""
Created on Thu Feb 27 21:10:39 2020

@author: manoj
"""

from flask import Flask
from flask import request, jsonify
import os
from os import path
from subprocess import check_output, call, run
import time
import base64
import azure_storage
import json


app = Flask(__name__)

def file_write(input_folderpath, input_file, public_url):
    if path.exists(input_folderpath):
        print("Folder already exists.")
    else:
        os.mkdir(input_folderpath)
        print("Folder created.")
        
    file = open(input_folderpath+"\\"+input_file, "w+")
    file.writelines("data"+"="+public_url)
    
    #for arg in request.args:
        #file.writelines(arg+"="+public_url+"\n")
    file.close()
    
def file_read(output_folderpath, output_file):     
    file = open(output_folderpath+"\\"+output_file, "r+")
    return file.read()
    

@app.route('/')
def hello():
    return "<p>For image Processing redirect to /v1/app/ocr_process</p><br><p> For creating a ticket and sending mail response redirect to /v1/app/create_ticket"

@app.route('/v1/app/ocr_process', methods=['POST'])
def ocr_process():
    input_folderpath = "C:\\Users\\Administrator\\Desktop\\Input_files"
    output_folderpath = "C:\\Users\\Administrator\\Desktop\\Output_files"
    output_file = "output_file.txt"
    input_file = "input_file.txt"
    aa_filepath =  "C:\\Users\\Administrator\\Documents\\Automation Anywhere Files\\Automation Anywhere\\My Tasks\\OCR.atmx"

    #if (request.content_type.startswith('application/json')):
    if request.method == 'POST':
        if request.json:
            image = request.json.get('data')
           
        elif request.form:
            image = request.form.get('data')

        else :
            return "Please provide data field"
        
    else :
        return "Please use POST method"

    img_path = "C:\\Users\\Administrator\\Desktop\\Input_files\\imageToSave.jpg"

    base64_img_bytes = image.encode('utf-8')
    
    # Convert the base64 file to image format
    with open(img_path, "wb") as fh:
        decoded_image_data = base64.decodebytes(base64_img_bytes)
        fh.write(decoded_image_data)
    fh.close()


    public_url = azure_storage.upload_file(img_path)
    file_write(input_folderpath, input_file, public_url)
       
    #proc_status = run(aa_filepath)
    proc_status = check_output(aa_filepath, shell=True)
    print(proc_status)
    
    while not os.path.exists(output_folderpath+"\\"+output_file):
        time.sleep(1)

    str_output = file_read(output_folderpath, output_file)
    print(str_output)

    json_output = json.loads(str_output)
    
    for region in json_output['regions']:
        for line in region['lines']:
            for word in line['words']:
                if ('Order:' in word['text']) and ('74' in word['text']):
                    print("found")
                    output = {"name":"ASHIF", "items":["1 Med BU Corn n Chees","EDV PIZ @ 199 BU","1 Med NHT Dbl_Che Mar", "EDV PIZ@ 199HT", "1 33cm x 30.5cm Paper","3 Sachet Sachet @ 0.8"]}
    
    return output
    
    
@app.route('/v1/app/create_ticket', methods=['POST'])
def create_ticket():
    input_folderpath = "C:\\Users\\Administrator\\Desktop\\Input_files"
    output_folderpath = "C:\\Users\\Administrator\\Desktop\\Output_files"
    output_file = "output_file.txt"
    input_file = "input_file.txt"
    aa_filepath_negative = "C:\\Users\\Administrator\\Documents\\Automation Anywhere Files\\Automation Anywhere\\My Tasks\\REST.atmx"
    aa_filepath_positive = "C:\\Users\\Administrator\\Documents\\Automation Anywhere Files\\Automation Anywhere\\My Tasks\\emailconfirmation\\emailconfirmation.atmx"

    if request.method == 'POST':
        if request.json:
            caller = request.json.get('caller')
            short_description = request.json.get('short_description')
            sentiment = request.json.get('sentiment') 
        elif request.form:
            caller = request.form.get('caller')
            short_description = request.form.get('short_description')
            sentiment = request.form.get('sentiment')
        else :
            return "Please provide caller, short_description, sentiment field"

    else :
        return "Please use POST method"
    
    if sentiment == 'positive':
        if path.exists(input_folderpath):
            print("Folder already exists.")
        else:
            os.mkdir(input_folderpath)
            print("Folder created.")
        
        file = open(input_folderpath+"\\"+input_file, "w+")
        file.writelines("caller"+"="+caller+"\n")
        file.writelines("short_description"+"="+short_description+"\n")
        file.writelines("sentiment"+"="+sentiment+"\n")   
        file.close()
        
        #file_write(input_folderpath, input_file, request)
        proc_status = check_output(aa_filepath_positive, shell=True)
        print(proc_status)
        
    elif (sentiment == 'negative') or (sentiment == 'neutral'):
        if path.exists(input_folderpath):
            print("Folder already exists.")
        else:
            os.mkdir(input_folderpath)
            print("Folder created.")
        
        file = open(input_folderpath+"\\"+input_file, "w+")
        file.writelines("caller"+"="+caller+"\n")
        file.writelines("short_description"+"="+short_description+"\n")
        file.writelines("sentiment"+"="+sentiment+"\n")
        file.close()
        
        #file_write(input_folderpath, input_file, request)
        proc_status = check_output(aa_filepath_negative, shell=True)
        print(proc_status)

        file = open(output_folderpath+"\\"+output_file, "r+", encoding='utf-8-sig')
        incident_id = file.read()
        return jsonify({'incident_id':incident_id.strip()})
    
    
    
    return 'This is Ticket creating process'

if __name__ == '__main__':
    #app.debug = True
    app.run(host = '0.0.0.0', port = '5000')
