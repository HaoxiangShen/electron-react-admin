import { execSync } from 'child_process';
import ip from 'ip';
import md5 from 'md5';
import { machineIdSync } from 'node-machine-id';
import si from 'systeminformation';

/**
 * 获取硬件信息
 *
 * @class Native
 */
class Native {
  private ipAddress: string = ip.address();
  // 将mac地址反序后md5，与执行段编码作区分
  private machineId: string = md5(machineIdSync().split('').reverse().join());
  private cpuId: string = this.getCpuId();
  private distId: string;

  constructor() {
    this.getNative();
  }

  private async getNative() {
    this.distId = await this.getDisk();
  }

  get ip() {
    return this.ipAddress;
  }

  get machine() {
    return this.machineId;
  }

  get cpu() {
    return this.cpuId;
  }

  get disk() {
    return this.distId;
  }

  private getCpuId() {
    const [, cpuId] = execSync('wmic cpu get processorid').toString().split('\n');
    return cpuId;
  }

  private async getDisk() {
    const disks = await si.diskLayout();
    const diskId = disks.map(disk => disk.serialNum).join('_');
    return diskId;
  }
}

const native = new Native();

export { native };
