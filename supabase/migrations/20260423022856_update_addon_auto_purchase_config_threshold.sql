/*
  # 更新增量包自动购买配置表结构

  ## 变更说明
  将触发条件从"余量百分比阈值 + 成员积分不足触发"简化为单一条件：
  "当增量包余量（绝对积分值）低于设定值时，自动购买 1 个包"。

  ## 修改内容
  - `addon_auto_purchase_config` 表
    - 新增列 `threshold_credits`（integer）：当增量包余量低于此积分值时触发购买，默认 1000 分
    - 移除列 `threshold_percentage`：原百分比阈值，不再使用
    - 移除列 `trigger_on_member_insufficient`：成员积分不足触发条件，不再使用

  ## 注意
  - 使用 IF EXISTS / IF NOT EXISTS 保证迁移幂等性
  - 不删除任何已有数据行，仅变更列结构
*/

DO $$
BEGIN
  -- 新增 threshold_credits 列
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'addon_auto_purchase_config' AND column_name = 'threshold_credits'
  ) THEN
    ALTER TABLE addon_auto_purchase_config
      ADD COLUMN threshold_credits integer DEFAULT 1000 CHECK (threshold_credits >= 0);
  END IF;

  -- 移除 threshold_percentage 列
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'addon_auto_purchase_config' AND column_name = 'threshold_percentage'
  ) THEN
    ALTER TABLE addon_auto_purchase_config DROP COLUMN threshold_percentage;
  END IF;

  -- 移除 trigger_on_member_insufficient 列
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'addon_auto_purchase_config' AND column_name = 'trigger_on_member_insufficient'
  ) THEN
    ALTER TABLE addon_auto_purchase_config DROP COLUMN trigger_on_member_insufficient;
  END IF;
END $$;
