import { role} from '~/role'
// import notifier from "~/plugins/notifier"
export  default function ip({redirect, res, req,next}){
    const userl = localStorage.getItem('userl')
    if (!localStorage.getItem('authToken')) {
      alert('Vous devez vous connecter')        
        next({ name: 'login' })
    } else if (parseInt(userl) < role.inspecteurG) {
      alert('Vous devez êtes inspecteur principal')             
             next({ name: 'index' })
                } else {
            // next()
    }
}