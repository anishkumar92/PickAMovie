// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { FavoriteButtonComponent } from './favorite-button/favorite-button.component';

@NgModule({
  declarations: [
    FavoriteButtonComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  exports: [
    FavoriteButtonComponent
  ]
})
export class SharedModule { }