import * as React from 'react';
import {useState} from 'react';
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
  const [web3, setWeb3] = useState()
  const theme = createTheme()

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

  React.useEffect(() => {
    connectWallet()
  }, [])

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
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            height: '100vh',
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
  );
}

export default App;
