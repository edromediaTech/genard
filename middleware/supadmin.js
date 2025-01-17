import { role} from '~/role'
// import notifier from "~/plugins/notifier"
export  default function ip({redirect, res, req,next}){
    const userl = localStorage.getItem('userl')
    if (!localStorage.getItem('authToken')) {
      alert('Vous devez vous connecter')        
        next({ name: 'index' })
    } else if (parseInt(userl) < role.supadmin) {
      alert('Vous devez êtes super admin')             
             next({ name: 'inspire' })
                } else {
            // next()
    }
}