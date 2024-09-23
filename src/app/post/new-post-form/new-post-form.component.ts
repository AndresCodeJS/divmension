import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Store } from '../../store/store';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ImageResizeService,
  S3UploaderService,
} from '../../shared/data-access/s3.service';
import { constants } from '../../global';
import { PostsService } from '../../user/data-access/post.service';


@Component({
  selector: 'app-new-post-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './new-post-form.component.html',
  styles: ``,
})
export default class NewPostFormComponent implements OnInit, OnDestroy {
  constructor(
    private imageResizer: ImageResizeService,
    private s3Uploader: S3UploaderService,
    private router: Router
  ) {}

  fb = inject(NonNullableFormBuilder);
  form = this.fb.group({
    photo: this.fb.control('', {
      validators: [Validators.required],
    }),
    description: this.fb.control('', {
      validators: [Validators.required],
    }),
  });

  get photo() {
    return this.form.get('photo') as FormControl;
  }

  get description() {
    return this.form.get('description') as FormControl;
  }

  //Registro de errores cuando el usuario o password son incorrectos ------------------------------
  /*   errors = {
    username: false,
    password: false,
  }; */

  onKeyDown() {
    /*   this.errors.username = false;
    this.errors.password = false; */
  }

  //-----------------------------------------------------------------------------------------------

  store = inject(Store);

  //Ocultar el boton al abrir el formulario de nuevo post ----------------------------------------
  ngOnInit(): void {
    if(!this.store.user().username){
      this.router.navigate(['/']);
    }

    this.store.hideFloatingButton(true);
  }

  //Mostrar el boton al cerrar el formulario -----------------------------------------------------
  ngOnDestroy(): void {
    this.store.hideFloatingButton(false);
    this.form.reset()
  }

  // CARGA DE IMAGEN --------------------------------------------------------------------
  selectedFile: File | null = null;

  imageUrl: string | ArrayBuffer | null = null;

  async onFileSelected(event: any) {
    if (event.target) {
      if (event.target.files.length) {
        if (event.target.files[0].type.match(/image\/*/)) {
          // solo imagenes
          this.selectedFile = event.target.files[0] as File;

          //Cargar la imagen para mostrarla
          const reader = new FileReader();
          reader.onload = (e: ProgressEvent<FileReader>) => {
            this.imageUrl = e.target?.result || null;
          };
          reader.readAsDataURL(this.selectedFile);

          /* await this.uploadFile(selectedFile); */
        } else {
          this.selectedFile = null;
        }
      }
    }
  }

  triggerFileInput() {
    // Obtiene una referencia al input de archivo
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    // Simula un clic en el input de archivo
    fileInput.click();
  }

  post = constants.POST;

  postService = inject(PostsService);

  isLoading = false;

  async uploadFile(selectedFile: File) {
    if (selectedFile) {
      //Se modifican las dimensiones de la imagen
      const resizedFile = (await this.imageResizer.resizeImage(
        selectedFile,
        400,
        400
      )) as File;

      this.isLoading = true;

      //Subida de la foto a S3
      this.s3Uploader
        .uploadFile(resizedFile, this.post)
        .then((imageUrl) => {

          //Registro del post en la base de datos
          this.postService
            .createPost({
              description: this.form.getRawValue().description,
              imageUrl,
            })
            .subscribe({
              next: (response) => {
                this.form.reset()
                this.isLoading = false
                this.router.navigate([
                  `/user/profile/${this.store.user().username}`,
                ]);
              },
              error: (error) => {
                console.log(error);
                this.isLoading = false
              },
            });
        })
        .catch((error) => {
          console.log(error);
          this.isLoading = false
        });
    }
  }

  async onSubmit() {
    if (!this.form.invalid) {
      if (this.selectedFile) {
        await this.uploadFile(this.selectedFile);
      } else {
        console.log('no se encontro el archivo');
      }
    }
  }
}
