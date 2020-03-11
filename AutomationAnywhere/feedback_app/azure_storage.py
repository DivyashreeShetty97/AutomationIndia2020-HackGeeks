# -*- coding: utf-8 -*-
"""
Created on Wed Feb 26 11:29:28 2020

@author: EI08288
"""

import os, uuid, sys
from azure.storage.blob import BlockBlobService, PublicAccess

container_name ='quickstartblobs'

def delete_file():
    #block_blob_service.delete_container(container_name)
    print("")

def upload_file(full_path_to_file):
    try:
        acc_name = 'accname'
        # Create the BlockBlockService that is used to call the Blob service for the storage account
        block_blob_service = BlockBlobService(account_name = acc_name, account_key = 'acckey')

        # Create a container called 'quickstartblobs'.
        block_blob_service.create_container(container_name)

        # Set the permission so the blobs are public.
        block_blob_service.set_container_acl(container_name, public_access=PublicAccess.Container)

        local_file_name = "Bill.jpg"

        print("Temp file = " + full_path_to_file)
        print("\nUploading to Blob storage as blob" + local_file_name)

        # Upload the created file, use local_file_name for the blob name
        block_blob_service.create_blob_from_path(container_name, local_file_name, full_path_to_file)

        # List the blobs in the container
        print("\nList blobs in the container")
        generator = block_blob_service.list_blobs(container_name)
        for blob in generator:
            print("\t Blob name: " + blob.name)
            
        return "https://"+acc_name+".blob.core.windows.net/"+container_name+"/"+local_file_name
    except Exception as e:
        print(e)


# Main method.
if __name__ == '__main__':
    upload_file()
