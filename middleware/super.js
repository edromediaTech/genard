// import notifier from "~/plugins/notifier"
export  default function ip({redirect, res, req,next}){
    const userl = localStorage.getItem('userl')
    if (!localStorage.getItem('authToken')) {
      alert('Vous devez vous connecter')        
        next({ name: 'login' })
    } else if (parseInt(userl) < 4) {
      alert('Vous devez êtes superviseur')             
             next({ name: 'index' })
                } else {
            // next()
    }
}