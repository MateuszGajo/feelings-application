export const createUser = credentials => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firebase = getFirebase();
    const firestore = getFirestore();

    firebase
      .auth()
      .createUserWithEmailAndPassword(credentials.email, credentials.password)
      .then(resp => {
        return firestore
          .collection("user")
          .doc(resp.user.uid)
          .set({
            firstName: credentials.firstName,
            lastName: credentials.lastName,
            initials:
              credentials.firstName[0].toUpperCase() +
              credentials.lastName[0].toUpperCase(),
            date: new Date()
          });
      })
      .then(() => {
        dispatch({ type: "CREATE_USER" });
      })
      .catch(err => {
        dispatch({ type: "CREATE_USER_ERROR", err });
      });
  };
};

export const signIn = credentials => {
  return (dispatch, getState, { getFirestore, getFirebase }) => {
    const firebase = getFirebase();
    firebase
      .auth()
      .signInWithEmailAndPassword(credentials.email, credentials.password)
      .then(() => {
        dispatch({ type: "LOGIN_SUCCESS" });
      })
      .catch(err => {
        dispatch({ type: "LOGIN_ERROR", err });
      });
  };
};

export const signOut = () => {
  return (dispatch, getState, { getfirestore, getFirebase }) => {
    const firebase = getFirebase();
    firebase
      .auth()
      .signOut()
      .then(() => {
        dispatch({ type: "SIGNOUT_SUCCESS" });
      });
  };
};

export const changeName = name => {
  return (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore();
    const state = getState();
    const auth = state.firebase.auth;
    const project = state.firestore.ordered.project;

    firestore
      .collection("user")
      .doc(auth.uid)
      .update({
        firstName: name.firstName,
        lastName: name.lastName
      })
      .then(() => {
        let array = [];
        if (project !== undefined) {
          project.map(project => {
            if (project.authorId == auth.uid) {
              firestore
                .collection("project")
                .doc(project.id)
                .set({
                  ...project,
                  authorFirstName: name.firstName,
                  authorLastName: name.lastName
                });
            }
            project.comments.map((comment, index) => {
              if (comment.authorId == auth.uid) {
                const newComment = {
                  ...comment,
                  authorFirstName: name.firstName,
                  authorLastName: name.lastName
                };
                array.push(newComment);

                if (project.authorId == auth.uid) {
                  firestore
                    .collection("project")
                    .doc(project.id)
                    .set({
                      ...project,
                      authorFirstName: name.firstName,
                      authorLastName: name.lastName,
                      comments: [...array]
                    });
                } else {
                  firestore
                    .collection("project")
                    .doc(project.id)
                    .set({
                      ...project,
                      comments: [...array]
                    });
                }
              } else {
                array.push(comment);
              }
            });
          });
        }
      });
  };
};
