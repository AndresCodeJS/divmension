import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { IUserStore } from '../shared/interfaces/user.interface';
import { inject } from '@angular/core';
import { getToken, removeToken } from '../user/data-access/local-storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface IState {
  user: IUserStore;
  isLoading: boolean;
  hideButton: boolean
}

const initialState: IState = {
  user: {
    username: '',
    email: '',
    fullname: '',
    photoUrl: '',
  },
  isLoading: false,
  hideButton: false
};

export const Store = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(({ user, isLoading, ...store }) => {
    return {
      setUser(user: IUserStore) {
        patchState(store, { user });
      },
      setPhoto(url:string) {
        patchState(store, {  user:{...user(), photoUrl:url} });
      },
      removeUser() {
        patchState(store, {
          user: {
            username: '',
            email: '',
            fullname: '',
            photoUrl: '',
          },
        });
      },

      setLoading(value: boolean) {
        patchState(store, { isLoading: value });
      },
      hideFloatingButton(value: boolean){
        patchState(store, { hideButton: value});
        
      }
    };
  }),
  withHooks({
    onInit(store) {
      //Usado para cargar el usuario logeado, al refrescar la pagina
      const http = inject(HttpClient);

      if (getToken()) {
        let authToken = getToken();

        const headers = new HttpHeaders({
          Authorization: authToken!,
        });

        //Se pasa a estado de carga para no mostrar los botones en el header antes de validar
        //si hay un usuario cargado
        store.setLoading(true);

        http
          .get<IUserStore>(
            'https://2cqvxzd6yh.execute-api.us-east-1.amazonaws.com/prod/users/refresh-page',
            { headers }
          )
          .subscribe({
            next: (user) => {
              store.setUser(user);
              store.setLoading(false);
            },
            error: (err) => {
              console.log(err)
              store.setLoading(false);
              removeToken()
            },
          });
      }
    },
  })
);
