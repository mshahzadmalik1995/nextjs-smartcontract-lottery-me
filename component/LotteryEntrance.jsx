import { useWeb3Contract } from "react-moralis"
import {abi, contractAddresses} from '../constants'
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import {ethers} from "ethers";
import { useNotification } from "web3uikit";
export default function LotterEntrance(){
    
    const {chainId: chainIdHex, isWeb3Enabled} = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null;
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayer, setNumPlayer] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")
    
    const dispatch = useNotification()
    //console.log(parseInt(chainIdHex))
    const {runContractFunction: enterRaffle, isLoading, isFetching} = useWeb3Contract({
        abi:abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params:{},
        msgValue:entranceFee
    })

    const {runContractFunction: getEntranceFee} = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const {runContractFunction: getNumberOfPlayers} = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const {runContractFunction: getRecentWinner} = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    
    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString();
        const numPlayerFromCall = (await getNumberOfPlayers()).toString();
        const recentWinnerFromCall = await getRecentWinner()
        setEntranceFee(entranceFeeFromCall)
        setNumPlayer(numPlayerFromCall);
        setRecentWinner(recentWinnerFromCall)
       //console.log(`something : ${something}`)
    }

    useEffect(()=>{
        if(isWeb3Enabled){
            updateUI()
        }
    },[isWeb3Enabled])

    const handleSuccess = async function (tx){
        await tx.wait(1);
        handleNewNotification(tx);
        updateUI()
    }

    const handleNewNotification = function (){
        dispatch({
            type: "info",
            message: "Transaction Complete",
            title: "Tx Notification",
            position: "topR",
            icon:"bell",
        })
    }

    return(
        <div>
            Hi from lottery entrance!
            {raffleAddress ? (
                <div>
                    <button 
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={
                        async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }
                    }>Enter Raffle</button><br/>
                    Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")}<br/>
                    Number Of Players : {numPlayer}<br/>
                    Recent Winner : {recentWinner}<br />
                    </div>
            ):(
                <div>No Raffle Address Detected!!</div>
            )}
        </div>
    )
}