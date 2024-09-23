import { inject, Injectable } from '@angular/core';
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { UsersService } from '../../user/data-access/users.service';
import { constants } from '../../global';

@Injectable({
  providedIn: 'root',
})
export class S3UploaderService {
  public s3: S3Client | undefined;

  constructor(private usersService: UsersService) {}

  region = 'us-east-1'; //environment.region

  async uploadFile(file: File, type: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      await this.usersService.getS3Credentials().subscribe({
        next: async (response) => {
          if (!response.AccessKeyId) {
            reject('No se obtuvieron las credenciales');
          }
          let cred = {
            accessKeyId: response.AccessKeyId,
            secretAccessKey: response.SecretAccessKey,
            sessionToken: response.SessionToken,
          };
          this.s3 = new S3Client({
            region: this.region,
            credentials: cred,
          });

          const fileType = file.type.split('/');

          let objectKey = '';

          if (type == constants.PROFILE) {
            objectKey = `${response.user}/profile/${new Date().getTime()}`;
          }

          if (type == constants.POST) {
            objectKey = `${response.user}/posts/${new Date().getTime()}-${
              file.name
            }.${fileType[1]}`;
          }

          const bucketName = 'divmension-12e561930bc7'; //environment.bucketName

          const fileName = `${response.user}/profile/`;

          if (this.s3) {
            try {
              //Si la operacion es sobre la foto de perfil
              if (type == constants.PROFILE) {
                //Proceso para borrar la foto cargada anteriormente

                const listParams = {
                  Bucket: bucketName,
                  Prefix: fileName,
                };

                const listCommand = new ListObjectsV2Command(listParams);
                const listedObjects = await this.s3.send(listCommand);

                //Verifica que la carpeta no este vacia
                if (listedObjects.Contents) {
                  // Borra la foto anterriomente cargada en el perfil
                  for (const object of listedObjects.Contents) {
                    const deleteCommand = new DeleteObjectCommand({
                      Bucket: bucketName,
                      Key: object.Key,
                    });
                    await this.s3.send(deleteCommand);
                  }
                } else {
                  console.log('Folder is already empty');
                }
              }

              //Guarda la foto en el bucket
              const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: objectKey,
                Body: file,
                ACL: 'public-read',
                ContentType: file.type, //indicarle al bucket de que tipo es el archivo que se esta subiendo
              });

              const response = await this.s3.send(command);

              const objectUrl = `https://${bucketName}.s3.${this.region}.amazonaws.com/${objectKey}`;

              resolve(objectUrl);
            } catch (error) {
              reject(error);
            }
          } else {
            reject('The file could not be loaded');
          }
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }
}
@Injectable({
  providedIn: 'root',
})
export class ImageResizeService {
  async resizeImage(
    file: File,
    maxWidth: number,
    maxHeight: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx!.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            resolve(blob!);
          }, file.type);
        };
        img.src = e.target.result;
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
}
