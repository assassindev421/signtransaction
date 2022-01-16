import * as React from 'react';
import {useState} from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Web3 from 'web3';

function App() {
  const [account, setAccount] = useState()
  const [ethereum, setEthereum] = useState()
  const [web3, setWeb3] = useState()
  const [network, setNetwork] = useState('Checking Network...')
  const theme = createTheme()

  const networksTypes = {
    1: 'Ethereum Mainnet',
    3: 'Ropsten Testnet',
    4: 'Rinkeby Testnet',
    42: 'Kovan Testnet',
    56: 'Binance Mainnet',
    97: 'Binance Testnet',
    137: 'Matic Mainnet',
    250: 'Fantom Opera',
    4002: 'Fantom Testnet',
    80001: 'Polygon Testnet'
  }

  const connectWallet = async() => {
    if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
      const _web3 = new Web3(window.web3.currentProvider)
      setWeb3(_web3)
      try{
          await _web3.currentProvider.enable()
      } catch(error) {
          console.log("Error occured while connect metamask:", error)
          return
      }
      const _account = await _web3.eth.getAccounts()
      setAccount(_account[0])
    } else {
      console.log("Please install metamask")
    }
  }

  const checkNetwork = async(chainId) => {
    if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
      const _web3 = new Web3(window.web3.currentProvider)
      const chainId = await _web3.eth.getChainId()
      if(networksTypes[chainId]) {
        setNetwork(networksTypes[chainId])
      } else {
        setNetwork('Custom Network')
      }
    } else {
      console.log("Please install metamask")
    }
  }

  React.useEffect(() => {
    checkNetwork()
  }, [])

  window.ethereum.on('chainChanged', (chainId) => {
    const dexChainId = parseInt(chainId).toString(10)
    if(networksTypes[dexChainId]) {
      setNetwork(networksTypes[dexChainId])
    } else {
      setNetwork('Custom Network')
    }
  })

  const filterAddress = (address) => {
    return address.substr(0, 5)+ '...' + address.substr(38, 42)
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    let obj = await web3.eth.personal.sign(data.get('message'), account)

    var receiver = data.get('receiver');
    var tx = {
      from: account,
      to: receiver,
      gas: 184000,
      value: web3.utils.toWei(data.get('amount'), 'ether'),
      data: obj
    };
    web3.eth.sendTransaction(tx)
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {network}
            </Typography>
            <Button color="secondary" variant="contained" onClick={() => connectWallet()}>
              { account ? filterAddress(account) : 'Connect Wallet' }
            </Button>
          </Toolbar>
        </AppBar>
      </Box>
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              height: '88vh',
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" variant="h5">
              Send Message Signed Transaction
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Wallet Receive Address"
                name="receiver"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="message"
                label="Message to Sign"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="amount"
                type="number"
                label="Amount Of Eth To Send"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Send Transaction
              </Button>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    </>
  );
}

export default App;
