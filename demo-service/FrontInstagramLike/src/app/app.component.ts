import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { faPlus, faTrashAlt, faPencilAlt, faCheck } from "@fortawesome/free-solid-svg-icons";

import { PostService } from "./post.service";
import { CommentService } from "./comment.service";
import { Post } from "./models";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  faPlus = faPlus;
  faTrashAlt = faTrashAlt;
  faPencilAlt = faPencilAlt;
  faCheck = faCheck;

  // This is used to know whether or not an edit form is shown. It is
  // instantiated in the constructor, but populated when we have fetched all
  // forms and comments from the API.
  // It should look like this:
  // {
  //   'post': [
  //     1 -> false, // This means the edit form of the post of id 1 is not shown at the moment
  //     2 -> false,
  //     3 -> true,
  //     ...
  //   ],
  //   'comment': [
  //     1 -> false,
  //     2 -> true, // This means the edit form of the comment of id 2 is shown right now
  //     3 -> false,
  //     ...
  //   ]
  // }

  isEditFormShown: Map<String, Map<Number, Boolean>>;
  // This is used to store all edit forms for the posts and comments. It is
  // instantiated in the constructor, but populated when we have fetched all
  // forms and comments from the API.
  // It should look like this:
  // {
  //   1 -> {
  //     'form': <edit form of post 1>,
  //     'comments': [
  //       1 -> <edit form of comment 1>,
  //       2 -> <edit form of comment 2>,
  //       ...
  //     ]
  //   },
  //   2 -> {
  //     'form': <edit form of post 2>,
  //     'comments': [
  //       1 -> <edit form of comment 3>,
  //       ...
  //     ]
  //   },
  // }
  editForms: Map<Number, {form: FormGroup, comments: Map<Number, FormGroup>}>

  allPosts: Post[];
  form_add_comment: FormGroup;
  form_add_post: FormGroup;

  constructor(
    private post: PostService,
    private comment: CommentService,
    private form_builder: FormBuilder,
  ) {
    this.isEditFormShown = new Map<String, Map<Number, Boolean>>([
      ["post", new Map<Number, Boolean>()],
      ["comment", new Map<Number, Boolean>()],
    ]);
    this.editForms = new Map();
    this.form_add_comment = this.form_builder.group({
      link: '',
    });
    this.form_add_post = this.form_builder.group({
      link: ''
    })
  }

  ngOnInit() {
    this.allPosts = [];
    this.getAllPosts();
  }

  getAllPosts() {
    this.post.getAllPosts().subscribe(data => {
      this.allPosts = data.posts;
      this.allPosts.map(post => {
        // On first load, the edit form is not shown
        this.isEditFormShown.get("post").set(post.id, false);

        // Create the edit form already filled with the link the image of the post
        let form_post = this.form_builder.group({'link': post.link});
        this.editForms.set(post.id, {
          form: form_post,
          comments: new Map()
        })
        post.comments.map(comment => {
          // On first load, the edit form is not shown
          this.isEditFormShown.get("comment").set(comment.id, false);

          // Create the edit form already filled with the link the text of the comment
          let form_comment = this.form_builder.group({'link': comment.link});
          this.editForms.get(post.id).comments.set(comment.id, form_comment)
        });
      });
    });
  }

  addComment(id_post: Number, data: {"link": String}) {
    if(data.link !== "") {
      this.comment.createCommentOnPost(id_post, data.link).subscribe(() => window.location.reload())
    }
  }

  addPost(data: {"link": String}) {
    if (data.link !== "") {
      this.post.createPost(data.link).subscribe(() => window.location.reload());
    }
  }

  deleteComment(id_comment: Number) {
    this.comment.deleteComment(id_comment).subscribe(() => window.location.reload());
  }

  deletePost(id_post: Number) {
    this.post.deletePost(id_post).subscribe(() => window.location.reload());
  }

  isFormDisplayed(type: String, id: Number) {
    let val = this.isEditFormShown.get(type).get(id);
    return val !== undefined ? val : false;
  }

  toggleForm(type: String, id: Number) {
    // type should either be "post" of "comment"
    // id is the id of the model for which we want the edit form
    let val = this.isEditFormShown.get(type).get(id);
    this.isEditFormShown.get(type).set(id, val !== undefined ? !val : false);
  }

  getEditForm(type: String, id: Number) {
    // type should either be "post" of "comment"
    // id is the id of the model for which we want the edit form
    let form: FormGroup;
    this.editForms.forEach((val, index) => {
      if (type === "post" && id === index) {
        // We want the edit form of a post and we have
        // found one whose id match the one we got
        form = val.form;
      } else if (type === "comment") {
        val.comments.forEach((val, index) => {
          if (id === index) {
            // We want the edit form of a comment and we have
            // found one whose id match the one we got
            form = val;
          }
        });
      }
    });
    return form;
  }

  editComment(id_comment: Number, data: {'link': String}) {
    this.comment.editComment(id_comment, data.link).subscribe(() => window.location.reload());
  }

  editPost(id_post: Number, data: {'link': String}) {
    this.post.editPost(id_post, data.link).subscribe(() => window.location.reload());
  }

}
