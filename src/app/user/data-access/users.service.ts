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

@Injectable({
  providedIn: 'root',
})
export class UsersService extends BaseHttpService {
  setSignUpUser(user: IUser): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/create`, user);
  }

  setLoginUser(credentials: ICredentials): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/login`, credentials);
  }

  getUserRefresh(): Observable<any> {
    let authToken = getToken();

    const headers = new HttpHeaders({
      Authorization: authToken || '',
      'Content-Type': 'application/json',
    });

    return this.http.get<any>(`${this.apiUrl}/users/refresh-page`, { headers });
  }

  getUserList(user: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/search/${user}`);
  }

  getUserProfile(username: string): Observable<any> {
    let authToken = getToken();

    const headers = new HttpHeaders({
      Authorization: authToken || '',
      'Content-Type': 'application/json',
    });

    return this.http.get<any>(`${this.apiUrl}/users/profile/${username}`, {
      headers,
    });
  }

  followUser(followingUser: string) {
    let authToken = getToken();

    const headers = new HttpHeaders({
      Authorization: authToken || '',
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(
      `${this.apiUrl}/users/follow`,
      { followingUser },
      { headers }
    );
  }

  unfollowUser(unfollowUser: string) {
    let authToken = getToken();

    const headers = new HttpHeaders({
      Authorization: authToken || '',
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(
      `${this.apiUrl}/users/unfollow`,
      { unfollowUser },
      { headers }
    );
  }

  getS3Credentials() {
    let authToken = getToken();

    const headers = new HttpHeaders({
      Authorization: authToken || '',
      'Content-Type': 'application/json',
    });

    return this.http.get<any>(`${this.apiUrl}/users/s3-credentials`, {
      headers,
    });
  }

  updateProfilePhoto(photoUrl: string) {
    let authToken = getToken();

    const headers = new HttpHeaders({
      Authorization: authToken || '',
      'Content-Type': 'application/json',
    });

    console.log('se llamara a la ruta')
    console.log(photoUrl)
    console.log(headers)

    return this.http.post<any>(
      `${this.apiUrl}/users/profile-photo`,
      { photoUrl },
      { headers }
    );
  }
}
