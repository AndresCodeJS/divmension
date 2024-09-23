import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../shared/data-access/base-http.service';
import {
  ICredentials,
  IUser,
  IUserList,
} from '../../shared/interfaces/user.interface';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { getToken } from './local-storage';
import {
  LastEvaluatedKey,
  IPost,
} from '../../shared/interfaces/post.interface';

@Injectable({
  providedIn: 'root',
})
export class PostsService extends BaseHttpService {
  createPost(post: IPost): Observable<any> {
    let authToken = getToken();

    const headers = new HttpHeaders({
      Authorization: authToken || '',
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(`${this.apiUrl}/posts/create`, post, {
      headers,
    });
  }
  getPostsByUser(lastPostKey: any): Observable<any> {
    let authToken = getToken();

    const headers = new HttpHeaders({
      Authorization: authToken || '',
      'Content-Type': 'application/json',
    });

    let pkParam = lastPostKey.pk.split('#')[0]; // -> obtiene el username
    let skParam = lastPostKey.sk;

    return this.http.get<any>(
      `${this.apiUrl}/posts/user/${pkParam}/${skParam}`,
      { headers }
    );
  }

  getAllPosts(lastPostKey?: LastEvaluatedKey): Observable<any> {
    let authToken = getToken();

    const headers = new HttpHeaders({
      Authorization: authToken || '',
      'Content-Type': 'application/json',
    });

    //Se envia none para obtener los primeros posts
    let lastUsername = 'none ';
    let lastPostId = 'none';

    //Usado para paginacion
    if (lastPostKey) {
      lastUsername = lastPostKey.sk.split('#')[1]; // -> obtiene el username
      lastPostId = lastPostKey.sk.split('#')[0];
    }

    return this.http.get<any>(
      `${this.apiUrl}/posts/all/${lastUsername}/${lastPostId}`,
      { headers }
    );
  }

  getPostDetails(username: string, postId: string): Observable<any> {
    let authToken = getToken();

    const headers = new HttpHeaders({
      Authorization: authToken || '',
      'Content-Type': 'application/json',
    });

    console.log('se va a llamar a', username, postId);

    return this.http.get<any>(
      `${this.apiUrl}/posts/details/${username}/${postId}`,
      { headers }
    );
  }

  likePost(postId: string): Observable<any> {
    let authToken = getToken();

    const headers = new HttpHeaders({
      Authorization: authToken || '',
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(
      `${this.apiUrl}/posts/like`,
      { postId },
      { headers }
    );
  }

  unLikePost(postId: string): Observable<any> {
    let authToken = getToken();

    const headers = new HttpHeaders({
      Authorization: authToken || '',
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(
      `${this.apiUrl}/posts/unlike`,
      { postId },
      { headers }
    );
  }

  postComment(postId: string, content: string): Observable<any> {
    let authToken = getToken();

    const headers = new HttpHeaders({
      Authorization: authToken || '',
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(
      `${this.apiUrl}/posts/comment`,
      { postId, content },
      { headers }
    );
  }

  getComments(
    postId: string,
    lastCommentKey: LastEvaluatedKey
  ): Observable<any> {
    console.log(postId);
    console.log(lastCommentKey.sk);

    return this.http.get<any>(
      `${this.apiUrl}/posts/comments-list/${postId}/${lastCommentKey.sk}`
    );
  }
}
