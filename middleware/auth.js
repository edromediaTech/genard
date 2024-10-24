// export default async function ({ store, redirect }) {
    
//     // Vérifier si le token existe dans le localStorage
//     const token = store.$cookies.get('authToken');


//    // const token = localStorage.getItem('authToken');
//     if (token) {
//         const base64Payload = token.split('.')[1];
//         const payload = Buffer.from(base64Payload, 'base64');
//             const info = JSON.parse(payload.toString());
//             console.log("default page") 
            
//       // Ici, vous pouvez également décoder le token pour récupérer les informations de l'utilisateur si nécessaire
//      // store.commit('setUser', info);
//       await store.dispatch('setUser', info);
    
//     } else {
//         redirect('/login')
//       // Rediriger l'utilisateur vers la page de connexion ou effectuer toute autre action nécessaire
//     }
//   }