import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const useUpdateUserProfile = ()=>{
    const queryClient = useQueryClient();
    const {mutateAsync: updateProfile,isPending: isUpdatingProfile} = useMutation({
		mutationFn: async(formData)=>{
			const res = await fetch("/api/users/update",{
				method:"POST",
				headers:{
					"Content-Type":"application/json"
				},
				body: JSON.stringify(
                    formData
				)
			})
			const data = await res.json();
			if(!res.ok){
				throw new Error(data.error || "Something went wrong");
			}
			return data;
		},
		onSuccess:()=>{
			
			Promise.all([
				queryClient.invalidateQueries({queryKey:["authUser"]}),
				queryClient.invalidateQueries({queryKey:["userProfile"]})
			])
			toast.success("Profile Update successfully");

		},
        onError: (error) => {
			toast.error(error.message);
        }
		
	})
    return {updateProfile,isUpdatingProfile};
}

export default useUpdateUserProfile;