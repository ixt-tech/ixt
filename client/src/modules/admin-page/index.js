import React from 'react';
import {
  Container,
  Divider,
} from 'semantic-ui-react';
import ReactDataGrid from 'react-data-grid';
import MemberDialog from '../../components/member-dialog'

import './styles.css';
import getWeb3 from '../../utils/getWeb3';
import IxtProtect from '../../contracts/IxtProtect.json';
import truffleContract from 'truffle-contract';
import Connecting from '../../components/connecting';
import { fromBn, toBn } from '../../utils/number';
import { fromTimestamp } from '../../utils/date';

class AdminPage extends React.Component {

  state = { web3: null, accounts: null, contract: null, members: [], columns: [] };

  constructor(props) {
    super(props);
    this.getCellActions = this.getCellActions.bind(this);
    this.getMembers = this.getMembers.bind(this);
    this.addMember = this.addMember.bind(this);
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      // Get the contract instance.
      const Contract = truffleContract(IxtProtect);
      Contract.setProvider(web3.currentProvider);
      const contract = await Contract.deployed();

      await this.getMembers(web3, contract);

      const defaultProps = {
        resizable: true
      };
      const columns = [
        { key: 'membershipNumber', name: 'Member ID', width: 100 },
        { key: 'memberAddress', name: 'Wallet address', width: 400 },
        { key: 'addedTimestamp', name: 'Added at', width: 150 },
        { key: 'stakedTimestamp', name: 'Staked at', width: 150 },
        { key: 'stakeBalance', name: 'Stake', width: 100 },
        { key: 'invitationBalance', name: 'Invitations', width: 100 },
        { key: 'loyaltyBalance', name: 'Loyalty', width: 100 },
        { key: 'invitationCode', name: 'Invitation code', width: 100 },
        { key: 'productsCovered', name: 'Products', width: 200 }
      ].map(c => ({ ...c, ...defaultProps }));

      this.setState({ web3, account, contract, columns });

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load your IXT Protect account. You must connect with your account you registered with.`
      );
      console.log(error);
    }
  };

  async addMember(member) {
    const web3 = this.state.web3;
    const contract = this.state.contract;
    const account = this.state.account;
    await contract.authoriseUser(
      web3.utils.fromAscii(member.membershipNumber),
      member.address,
      web3.utils.fromAscii(member.invitationCode),
      web3.utils.fromAscii(member.referralInvitationCode),
      {from: account});
    this.getMembers(web3, contract);
  }

  async getMembers(web3, contract) {
    const length = await contract.getMembersArrayLength();
    const members = [];
    for(let i = 0; i < length; i++) {
      let address = await contract.membersArray(i);
      let m = await contract.members(address);

      let stakeBalance, loyaltyBalance, invitationBalance = 0;
      if(m.joinedTimestamp.toNumber() > 0) {
        stakeBalance = fromBn(await contract.getStakeBalance(address));
        loyaltyBalance = fromBn(await contract.getLoyaltyRewardBalance(address));
        invitationBalance = fromBn(await contract.getInvitationRewardBalance(address));
      }

      let member = {
        membershipNumber: web3.utils.toAscii(m.membershipNumber),
        memberAddress: address,
        productsCovered: '',
        addedTimestamp: fromTimestamp(m.authorisedTimestamp),
        stakedTimestamp: fromTimestamp(m.joinedTimestamp),
        invitationCode: web3.utils.toAscii(m.invitationCode),
        stakeBalance: stakeBalance,
        loyaltyBalance: loyaltyBalance,
        invitationBalance: invitationBalance,
      }
      members.push(member);
    }
    this.setState({ members });
  }

  getCellActions(column, row) {
    return null;
  }

  render() {
    if (!this.state.web3) {
      return <Connecting />;
    }

    return (
      <Container>
        <h1>IXT Protect Admin</h1>
        <h4 className='address'>Address: { this.state.account }</h4>
        <MemberDialog account={this.state.account} web3={this.state.web3} contract={this.state.contract} postSubmit={this.addMember}/>
        <h2>Members</h2>
        <ReactDataGrid
          columns={this.state.columns}
          rowGetter={i => this.state.members[i]}
          rowsCount={30}
          minHeight={500}
          getCellActions={this.getCellActions}
        />
      </Container>
    );
  }
}

export default AdminPage;
