import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, inject,  OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { UsersService } from '../data-access/users.service';
import { IUserProfile } from '../../shared/interfaces/user.interface';
import { Store } from '../../store/store';
import {
  S3UploaderService,
  ImageResizeService,
} from '../../shared/data-access/s3.service';
import { constants } from '../../global';
import { truncateText } from '../../utils/stringManager';
import { elapsedTime } from '../../utils/timeManager';
import { PostCardComponent } from '../../post/post-card/post-card.component';
import { CheckedIconComponent } from '../utils/checked-icon/checked-icon.component';
import { PostsService } from '../data-access/post.service';
import { LoadingScreenComponent } from "../../shared/ui/loading-screen/loading-screen.component";
import PostViewComponent from "../../post/post-view/post-view.component";
import { IPostList } from '../../shared/interfaces/post.interface';
import { setToken } from '../data-access/local-storage';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [PostCardComponent, CheckedIconComponent, LoadingScreenComponent, PostViewComponent],
  templateUrl: './profile.component.html',
  styles: ``,
  providers: [UsersService],
})
export default class ProfileComponent implements OnInit {
  private subscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private s3Uploader: S3UploaderService,
    private imageResizer: ImageResizeService
  ) {}

  @ViewChild('postCardContainer') postCardContainer!: ElementRef;

  isFollowing = false;

  truncateDescription = truncateText;
  postDate = elapsedTime;

  loadingPosts = false;
  queryExecuted = false;

  private postsService = inject(PostsService);

  //Carga nuevos posts cuando se hace scroll hasta la penultima fila
  onScroll(event: any) {
    const element = event.target as HTMLElement;

    //Verdadero cuando se hace scroll hasta la penultima fila de la lista de posts
    const atBottom =
      element.scrollHeight - element.scrollTop < element.clientHeight + 500;

    if (atBottom && !this.queryExecuted && this.user.lastPostKey) {
      /* console.log('Llegaste al final del contenedor'); */

      this.loadingPosts = true;

      //Variable usada para no ejecutar la consulta mas de una vez
      this.queryExecuted = true;

      //Obtiene los siguientes posts al paginar haciendo scroll hacia abajo
      this.postsService.getPostsByUser(this.user.lastPostKey).subscribe({
        next: (response) => {
          if (response.posts.length) {
            console.log('responde, ', response.posts)
            let concatArray = this.user.posts.concat(response.posts);
            this.user.posts = concatArray;
            this.user.lastPostKey = response.lastEvaluatedKey;
            this.queryExecuted = false;
            this.loadingPosts = false;
          }
        },
        error: (error) => {
          console.log(error);
          this.queryExecuted = false;
          this.loadingPosts = false;
          this.user.lastPostKey = '';
        },
      });
    }
  }

  user: IUserProfile = {
    username: '',
    fullname: '',
    photoUrl: '',
    followers: 0,
    following: 0,
    postCounter: 0,
    posts: [],
    lastPostKey: '',
  };

  isLoading = false;
  isLoadingPhoto = false;
  userNotFound = false;

  // ABRIR/CERRAR POST -----------------------------------------

  post:IPostList = {
    username: '',
    postId: '',
    imageUrl: '',
    description: '',
    timeStamp: 0,
    likesQuantity: 0,
    commentsQuantity: 0,
    initialCommentsQuantity:0
  }

  isPostCardOpen = false
  showCommentsButton = false

  openPostCard(post: IPostList){
    this.postCardContainer.nativeElement.scrollTop = 0;
    this.post = post
    this.post.initialCommentsQuantity = post.commentsQuantity // usado para aplicar logica al mostrar comentarios
    if(post.description.length > 75){
      this.post.shortDescription = this.truncateDescription(post.description,75)
    }else{
      this.post.shortDescription = post.description
    }

    if(post.commentsQuantity>0){
      this.showCommentsButton = true
    }
    
    this.isPostCardOpen = true
  }

  closePostCard(){
    this.isPostCardOpen = false
    this.showCommentsButton = false
  }

  private usersService = inject(UsersService);

  store = inject(Store); //Inyeccion del store global

  //Seguir a usuario ----------------------------------------
  followUser() {
    this.usersService.followUser(this.user.username).subscribe({
      next: (response) => {
        console.log(response);
        this.isFollowing = true;
        this.user.followers = response.followers;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  //Dejar de seguir usuario ---------------------------------
  unfollowUser() {
    this.usersService.unfollowUser(this.user.username).subscribe({
      next: (response) => {
        console.log(response);
        this.isFollowing = false;
        this.user.followers = response.followers;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  //Subir Foto de perfil ----------------------------------------------

  selectedFile: File | null = null;

  async onFileSelected(event: any) {
    if (event.target) {
      if (event.target.files.length) {
        if (event.target.files[0].type.match(/image\/*/)) {
          // solo imagenes
          let selectedFile = event.target.files[0] as File;
          console.log('se cargo un archivo');
          await this.uploadFile(selectedFile);
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

  profile = constants.PROFILE;

  photoUrl: string | ArrayBuffer | null = '';

  async uploadFile(selectedFile: File) {
    if (selectedFile) {
      //Se modifican las dimensiones de la imagen
      const resizedFile = (await this.imageResizer.resizeImage(
        selectedFile,
        400,
        400
      )) as File;

      console.log('Normal Image');
      console.log(selectedFile.size);

      console.log('Image resized');
      console.log(resizedFile.size);

      this.user.photoUrl = '';
      this.isLoadingPhoto = true;
      this.s3Uploader
        .uploadFile(resizedFile, this.profile)
        .then((url) => {
          //se guarda la URL en la base de datos

          this.usersService.updateProfilePhoto(url).subscribe({
            next: (response) => {
              console.log(response);
              setToken(response.jwt)
              this.store.setPhoto(url)
              this.user.photoUrl = url;
              this.isLoadingPhoto = false;
            },
            error: (err) => {
              console.log(err);
              this.isLoadingPhoto = false;
            },
          });
        })
        .catch((error) => {
          console.log(error);
          this.isLoadingPhoto = false;
        });
    } else {
      console.log('no hay archivo');
    }
  }

  textoFormateado = '';

  // Cargar los datos al acceder al perfil del usuario -------------------------------------------------
  ngOnInit(): void {
    this.subscription = this.route.paramMap.subscribe((params) => {
      const usernameParam = params.get('username') || '';

      this.isLoading = true;

      //Peticion HTTP GET para obtener el perfil del usuario
      this.usersService.getUserProfile(usernameParam).subscribe({
        next: (response: any) => {
          console.log('respuesta', response.user);

          this.user = response.user;

          this.isFollowing = response.isFollowing;
          this.isLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
          this.userNotFound = true;
          this.isLoading = false;
        },
      });
    });
  }
}
