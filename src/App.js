import * as React from 'react';
import {useState} from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import crypto from 'crypto';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Web3 from 'web3';

function App() {
  const [account, setAccount] = useState()
  const [balance, setBalance] = useState()
  const [web3, setWeb3] = useState()
  const [chainId, setChainId] = useState(0)
  const [decrypt, setDecrypt] = useState('')
  const theme = createTheme()

  const networksTypes = {
    1: ['Ethereum Mainnet', 'ETH'],
    3: ['Ropsten Testnet', 'ETH'],
    4: ['Rinkeby Testnet', 'ETH'],
    42: ['Kovan Testnet', 'ETH'],
    56: ['Binance Mainnet', 'BNB'],
    97: ['Binance Testnet', 'BNB'],
    137: ['Matic Mainnet', 'MATIC'],
    250: ['Fantom Opera', 'FTM'],
    4002: ['Fantom Testnet', 'FTM'],
    80001: ['Polygon Testnet', 'MATIC']
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
      const _balance = _web3.utils.fromWei(await _web3.eth.getBalance(_account[0]), 'ether')
      setAccount(_account[0])
      setBalance(`${Number(_balance).toFixed(3)} ${networksTypes[chainId][1]}`)
    } else {
      console.log("Please install metamask")
    }
  }

  const checkNetwork = async(chainId) => {
    if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
      const _web3 = new Web3(window.web3.currentProvider)
      const chainId = await _web3.eth.getChainId()
      setChainId(chainId)
    } else {
      console.log("Please install metamask")
    }
  }

  React.useEffect(() => {
    checkNetwork(chainId)
  }, [chainId])

  window.ethereum.on('chainChanged', (chainId) => {
    const dexChainId = parseInt(chainId).toString(10)
    setChainId(dexChainId)
  })

  const filterAddress = (address) => {
    return address.substr(0, 5)+ '...' + address.substr(38, 42)
  }

  const createHashPassword = (password, salt) => {
    let hash = crypto.pbkdf2Sync(Buffer.from(password), Buffer.from(salt), 65536, 16, 'sha1');
    return hash;
  }

  const handleSendSubmit = async (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const algorithm = 'aes-128-cbc'
    const secretKey = crypto.randomBytes(32)
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(algorithm, createHashPassword(data.get('password'), secretKey), iv)
    const encrypted = Buffer.concat([cipher.update(data.get('message')), cipher.final()])
    const res = secretKey.toString('hex') + iv.toString('hex') + encrypted.toString('hex')

    //793fb1e0a35b8a54736bb14d29cce8b9b81955badce68be423c5bbb6b2b8f784
    var receiver = data.get('receiver')
    var tx = {
      from: account,
      to: receiver,
      gas: 184000,
      value: web3.utils.toWei(data.get('amount'), 'ether'),
      data: res.toString('hex')
    };
    web3.eth.sendTransaction(tx)
  };

  const fromHexString = (hexString) => {
    return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))
  }

  const handleDecryptSubmit = (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const algorithm = 'aes-128-cbc'
    const res = data.get('transaction')
    const cnt = res.length
    const secretKey = fromHexString(res.slice(2,66))
    const iv = fromHexString(res.slice(66, 98))
    const encrypted = fromHexString(res.slice(98, cnt))
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(createHashPassword(data.get('password'), secretKey)), iv)
    const decrypted = Buffer.concat([decipher.update(new Buffer(encrypted)), decipher.final()]);
    setDecrypt(decrypted.toString())
  }

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {networksTypes[chainId] ? networksTypes[chainId][0] : 'Custom Network'}
            </Typography>
            { account && <Button color="primary" variant="contained" disabled={true} style={{marginRight:'10px'}} onClick={() => connectWallet()}>
              {balance}
            </Button>}
            <Button color="secondary" variant="contained" onClick={() => connectWallet()}>
              { account ? filterAddress(account) : 'Connect Wallet' }
            </Button>
          </Toolbar>
        </AppBar>
      </Box>
      <ThemeProvider theme={theme}>
        <Container component="main">
          <CssBaseline />
          <Box
            sx={{
              height: '88vh',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{width:'40%'}}>
              <Typography component="h1" variant="h5">
                Send Message Signed Transaction
              </Typography>
              <Box component="form" onSubmit={handleSendSubmit} noValidate sx={{ mt: 1 }}>
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
                  name="password"
                  label="Password for Encrypt"
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
            </div>
            <div style={{width:'40%'}}>
              <Typography component="h1" variant="h5">
                Decrypt Message From Transaction
              </Typography>
              <Box component="form" onSubmit={handleDecryptSubmit} noValidate sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  multiline
                  rows={5}
                  label="Received Transaction Data"
                  name="transaction"
                  autoFocus
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password for Decrypt"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="decrypted"
                  label="Decrypted Message"
                  value={decrypt}
                  InputProps={{readOnly:true}}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Decrypt Transaction
                </Button>
              </Box>
            </div>
          </Box>
        </Container>
      </ThemeProvider>
    </>
  );
}

export default App;
