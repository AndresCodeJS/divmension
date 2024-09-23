import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { PostsService } from '../../user/data-access/post.service';
import {
  IPostList,
  LastEvaluatedKey,
} from '../../shared/interfaces/post.interface';
import { PostCardComponent } from '../../post/post-card/post-card.component';
import { LoadingScreenComponent } from "../../shared/ui/loading-screen/loading-screen.component";
import PostViewComponent from "../../post/post-view/post-view.component";
import { truncateText as truncateDescription } from '../../utils/stringManager';

@Component({
  selector: 'app-home-view',
  standalone: true,
  imports: [PostCardComponent, LoadingScreenComponent, PostViewComponent],
  templateUrl: './home-view.component.html',
  styles: ``,
})
export default class HomeViewComponent implements OnInit {
  postService = inject(PostsService);

  loadingScreen = false;

  loadingPosts = false;

  lastEvaluatedKey: LastEvaluatedKey = {
    pk: 'none',
    sk: 'none',
  };

  // ABRIR/CERRAR POST -----------------------------------------

  @ViewChild('postCardContainer') postCardContainer!: ElementRef;

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

  //Para ver los detalles del post en una ventana flotante
  openPostCard(post: IPostList) {

    this.postCardContainer.nativeElement.scrollTop = 0;
    this.post = post
    this.post.initialCommentsQuantity = post.commentsQuantity // usado para aplicar logica al mostrar comentarios
    if(post.description.length > 75){
      this.post.shortDescription = truncateDescription(post.description,75)
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

  //----------------------------------------------------------------------------------

  posts: IPostList[] = [];

  ngOnInit(): void {
    this.loadingScreen = true;

    //CARGA INICIAL POSTS
    this.postService.getAllPosts().subscribe({
      next: (response) => {

        if (response.posts.length) {
          this.posts = response.posts;
        }
       
        if (response.lastEvaluatedKey) {
          this.lastEvaluatedKey = response.lastEvaluatedKey;
        }

        this.loadingScreen = false;
      },
      error: (error) => {
        this.loadingScreen = false;
      },
    });
  }

  //CARGAR MAS POSTS CUANDO SE LLEGA A LA PEMULTIMA FILA DE LSO POSTS
  queryExecuted = false;

  onScroll(event: any) {

    const element = event.target as HTMLElement;

    //Verdadero cuando se hace scroll hasta la penultima fila de la lista de posts
    const atBottom =
      element.scrollHeight - element.scrollTop < element.clientHeight + 500;

      

    if (atBottom && !this.queryExecuted && this.lastEvaluatedKey.pk != 'none') {

      this.loadingPosts = true;

      //Variable usada para no ejecutar la consulta mas de una vez
      this.queryExecuted = true;

      //Obtiene los siguientes posts al paginar haciendo scroll hacia EL FINAL DE LA PAGINA
      this.postService.getAllPosts(this.lastEvaluatedKey).subscribe({
        next: (response) => {
  
          if (response.posts.length) {
            let concatArray = this.posts.concat(response.posts);
            this.posts = concatArray;
          }
         
          if (response.lastEvaluatedKey) {
            this.lastEvaluatedKey = response.lastEvaluatedKey;
          }else{
            this.lastEvaluatedKey = {
              pk: 'none',
              sk: 'none',
            };
          }

          this.loadingScreen = false;
          this.queryExecuted = false;
          this.loadingPosts = false;
        },
        error: (error) => {
          console.log(error);
          this.loadingScreen = false;
          this.queryExecuted = false;
          this.loadingPosts = false;
        },
      });

    }
  }
}
