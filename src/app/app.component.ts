import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserLoginService } from '../core/services/user-login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements  OnInit {
  authForm: FormGroup;
  focused;
  focusedPass;
  userExist = true;
  userCheck = false;

  password: string;
  errorMessage: string;

  constructor(private router: Router,
              private userLoginService: UserLoginService,
              private fb: FormBuilder
  ) {
    // use FormBuilder to create a form group
    this.authForm = this.fb.group({
      'username': [
        '',
        [Validators.required,
          Validators.minLength(4),
          Validators.pattern(/^[A-z0-9@.]*$/)]
      ],
      'password': [
        '',
        [Validators.required,
          Validators.minLength(6)]
      ]
    });
  }

  ngOnInit() {
    this.errorMessage = null;
    this.userLoginService.isAuthenticated(this);
  }

  submitForm() {
    const credentials = this.authForm.value;
    this.userCheck = true;
    this.userLoginService.authenticate(credentials.username, credentials.password, this);
  }

  isLoggedIn(message: string, isLoggedIn: boolean) {
    if (isLoggedIn) {
      this.router.navigateByUrl('/welcome');
    }
  }

  cognitoCallback(message: string, result?: any) {
    this.userCheck = false;
    if (message === null) {
      this.router.navigate(['/welcome']);
    } else {
      this.userExist = false;
    }
  }
}
