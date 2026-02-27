import supportLogService from "../../services/energy-poverty-support/SupportLogService";

export const getLogsByMember = async (req, res) => {
  try{
    const {memberId} = req.params;
    const logs = await supportLogService.getLogsByMember(memberId,50);
    return res.status(200).json(logs);
    
  }catch(error){
    return res.status(400).json({message:error});
  }
}